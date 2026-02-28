import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import campusInfo from '@/lib/university-context.json'

// Aggressively strip ALL whitespace/newline characters that may be injected by deployment tools
const rawKey = process.env.GEMINI_API_KEY || ''
const cleanKey = rawKey.replace(/\s/g, '')
const genAI = new GoogleGenerativeAI(cleanKey)

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
            return NextResponse.json({ success: false, message: '', error: 'Unauthorized' }, { status: 401 })
        }

        const userId = authHeader.slice(7).substring(0, 20)

        if (!checkRateLimit(userId)) {
            return NextResponse.json(
                { success: false, message: '', error: 'Rate limit exceeded. Max 30 requests per hour.' },
                { status: 429 }
            )
        }

        const { message, history = [] } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ success: false, message: '', error: 'Message is required' }, { status: 400 })
        }

        if (!cleanKey) {
            return NextResponse.json({ success: false, message: '', error: 'AI service not configured' }, { status: 503 })
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
                    const score = queryWords.filter((w: string) => w.length > 2 && faqText.includes(w)).length
                    return { ...faq, score }
                })
                scored.sort((a, b) => b.score - a.score)
                contextChunks = scored.slice(0, 5).filter((f: { score: number }) => f.score > 0)

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
Use the UNIVERSITY DATA below to answer student questions accurately.
Do not hallucinate. Do not make up contact numbers, specific dates, or registration deadlines not found in the data.

When information is NOT in the data (e.g., specific exam dates, last dates, or real-time schedules):
- Say that you don't have that specific detail
- Direct them to the relevant official resource from the university data (website, portal, phone, or email)
- Example: "For the exact last date to pay semester fees, please check the official website at https://www.anurag.edu.in/ or contact admissions at +91-8181057057 / admissionsic@anurag.edu.in"

UNIVERSITY DATA:
${JSON.stringify(campusInfo, null, 2)}

FAQ CONTEXT:
${contextText}

Always be friendly, helpful, and concise. Always end with: "Is there anything else I can help you with?"`

        // Build conversation history as a full prompt
        const historyText = (history as { role: string; content: string }[])
            .slice(-6)
            .map(h => `${h.role === 'assistant' ? 'Assistant' : 'User'}: ${h.content}`)
            .join('\n')

        const fullPrompt = historyText
            ? `${historyText}\nUser: ${message}\nAssistant:`
            : message

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt,
            generationConfig: {
                maxOutputTokens: 800,
            }
        })

        // Safe Gemini extraction with timeout
        const timeoutMs = 25000
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 25 seconds')), timeoutMs)
        )

        const result = await Promise.race([
            model.generateContent(fullPrompt),
            timeoutPromise
        ])

        const response = await result.response

        console.log('Gemini raw response candidates count:', response?.candidates?.length)

        const text =
            response?.candidates?.[0]?.content?.parts
                ?.map((p: { text?: string }) => p.text)
                ?.filter(Boolean)
                ?.join(' ') || 'No response generated. Please try again.'

        const sources = contextChunks.map(c => ({ question: c.question, category: c.category }))

        return new Response(
            JSON.stringify({
                success: true,
                message: text,
                sources,
            }),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        )
    } catch (error: any) {
        console.error('Gemini Error:', error)

        const friendlyMessage =
            error?.status === 403
                ? 'The AI service key is invalid or expired. Please contact the administrator.'
                : error?.status === 429
                    ? 'AI service rate limit reached. Please try again in a moment.'
                    : error?.message?.includes('timed out')
                        ? 'The AI took too long to respond. Please try again.'
                        : 'Something went wrong. Please try again.'

        return new Response(
            JSON.stringify({
                success: false,
                message: '',
                error: friendlyMessage
            }),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}
