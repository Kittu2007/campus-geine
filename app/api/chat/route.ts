import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

// Supabase admin client for server-side queries
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(userId)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + 3600000 }) // 1 hour
        return true
    }

    if (entry.count >= 30) return false
    entry.count++
    return true
}

export async function POST(request: NextRequest) {
    try {
        // Simple auth check via Bearer token (Firebase ID token)
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = authHeader.slice(7).substring(0, 20) // Use token prefix as rate limit key

        if (!checkRateLimit(userId)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Max 30 requests per hour.' },
                { status: 429 }
            )
        }

        const { message, history = [] } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        // RAG: Try to find relevant FAQs
        let contextChunks: { question: string; answer: string; category: string }[] = []

        try {
            // Fallback: load all FAQs as context (simpler and works without embeddings)
            const { data: faqs } = await supabase
                .from('faqs')
                .select('question, answer, category')
                .limit(50)

            if (faqs && faqs.length > 0) {
                // Simple keyword matching as fallback to vector search
                const queryWords = message.toLowerCase().split(/\s+/)
                const scored = faqs.map(faq => {
                    const faqText = `${faq.question} ${faq.answer}`.toLowerCase()
                    const score = queryWords.filter(w => w.length > 2 && faqText.includes(w)).length
                    return { ...faq, score }
                })
                scored.sort((a, b) => b.score - a.score)
                contextChunks = scored.slice(0, 5).filter(f => f.score > 0)

                // If keyword matching finds nothing, include top FAQs as general context
                if (contextChunks.length === 0) {
                    contextChunks = faqs.slice(0, 5)
                }
            }
        } catch {
            // Continue without FAQ context if DB query fails
        }

        const contextText = contextChunks.length > 0
            ? contextChunks.map(c => `Q: ${c.question}\nA: ${c.answer}`).join('\n\n')
            : 'No specific FAQ context available.'

        const systemPrompt = `You are Campus Buddy, the official AI assistant for Anurag University.
Answer ONLY based on the context below. If the answer is not in the context,
say: "I don't have that information yet. Please contact the student affairs office at the admin block."
Do not hallucinate. Do not make up contact numbers or dates.

CONTEXT:
${contextText}

Always be friendly and helpful. Always end with: "Is there anything else I can help you with?"`

        const chatMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...history.slice(-6).map((h: { role: string; content: string }) => ({
                role: h.role as 'user' | 'assistant',
                content: h.content,
            })),
            { role: 'user' as const, content: message },
        ]

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: chatMessages,
            stream: true,
            temperature: 0.3,
            max_tokens: 1024,
        })

        // Create streaming response
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                // Send sources first
                if (contextChunks.length > 0) {
                    const sourcesData = JSON.stringify({
                        type: 'sources',
                        sources: contextChunks.map(c => ({
                            question: c.question,
                            category: c.category,
                        })),
                    })
                    controller.enqueue(encoder.encode(`data: ${sourcesData}\n\n`))
                }

                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content || ''
                    if (content) {
                        const tokenData = JSON.stringify({ type: 'token', content })
                        controller.enqueue(encoder.encode(`data: ${tokenData}\n\n`))
                    }
                }
                controller.close()
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
