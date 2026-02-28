import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import campusInfo from '@/lib/university-context.json'

// OpenRouter API key — strip all whitespace to be safe
const openRouterKey = (process.env.OPENROUTER_API_KEY || '').replace(/\s/g, '')

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
    console.log('[chat] OpenRouter key length:', openRouterKey.length, '| model: meta-llama/llama-3.3-70b-instruct:free')

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

        if (!openRouterKey) {
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

        // Build messages array for OpenRouter (OpenAI-compatible format)
        const chatMessages = [
            { role: 'system', content: systemPrompt },
            ...(history as { role: string; content: string }[]).slice(-6).map(h => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content,
            })),
            { role: 'user', content: message },
        ]

        // Call OpenRouter with a 25-second timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 25000)

        let res: Response
        try {
            res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://campus-genie-eight.vercel.app',
                    'X-Title': 'Campus Buddy - Anurag University',
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.3-70b-instruct:free',
                    messages: chatMessages,
                    max_tokens: 800,
                    temperature: 0.7,
                }),
                signal: controller.signal,
            })
        } finally {
            clearTimeout(timeoutId)
        }

        if (!res.ok) {
            const errBody = await res.text()
            console.error('[chat] OpenRouter HTTP error:', res.status, errBody)
            throw new Error(`OpenRouter returned ${res.status}: ${errBody}`)
        }

        const data = await res.json()
        console.log('[chat] OpenRouter response id:', data?.id, '| choices:', data?.choices?.length)

        const text =
            data?.choices?.[0]?.message?.content?.trim() ||
            'No response generated. Please try again.'

        const sources = contextChunks.map(c => ({ question: c.question, category: c.category }))

        return new Response(
            JSON.stringify({ success: true, message: text, sources }),
            { headers: { 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('[chat] Error:', error?.message || error)

        const friendlyMessage =
            error?.message?.includes('abort') || error?.message?.includes('timed out')
                ? 'The AI took too long to respond. Please try again.'
                : error?.message?.includes('401') || error?.message?.includes('403')
                    ? 'AI service authentication failed. Please contact the administrator.'
                    : error?.message?.includes('429')
                        ? 'AI service rate limit reached. Please try again in a moment.'
                        : 'Something went wrong. Please try again.'

        return new Response(
            JSON.stringify({ success: false, message: '', error: friendlyMessage }),
            { headers: { 'Content-Type': 'application/json' } }
        )
    }
}
