import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Supabase client for FAQ queries
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
        rateLimitMap.set(userId, { count: 1, resetAt: now + 3600000 })
        return true
    }

    if (entry.count >= 30) return false
    entry.count++
    return true
}

export async function POST(request: NextRequest) {
    try {
        // Auth check via Bearer token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = authHeader.slice(7).substring(0, 20)

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

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
        }

        // RAG: Try to find relevant FAQs
        let contextChunks: { question: string; answer: string; category: string }[] = []

        try {
            const { data: faqs } = await supabase
                .from('faqs')
                .select('question, answer, category')
                .limit(50)

            if (faqs && faqs.length > 0) {
                const queryWords = message.toLowerCase().split(/\s+/)
                const scored = faqs.map(faq => {
                    const faqText = `${faq.question} ${faq.answer}`.toLowerCase()
                    const score = queryWords.filter(w => w.length > 2 && faqText.includes(w)).length
                    return { ...faq, score }
                })
                scored.sort((a, b) => b.score - a.score)
                contextChunks = scored.slice(0, 5).filter(f => f.score > 0)

                if (contextChunks.length === 0) {
                    contextChunks = faqs.slice(0, 5)
                }
            }
        } catch {
            // Continue without FAQ context
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

        // Build conversation history for Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const chatHistory = history.slice(-6).map((h: { role: string; content: string }) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
        }))

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'System instructions: ' + systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood! I am Campus Buddy, the AI assistant for Anurag University. I will answer only based on the provided context. How can I help you?' }] },
                ...chatHistory,
            ],
        })

        const result = await chat.sendMessageStream(message)

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

                for await (const chunk of result.stream) {
                    const content = chunk.text()
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
