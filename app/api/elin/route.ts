import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Basic in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>()
const RATE_LIMIT_MAX = 20 // max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    console.log('[elin-chat] --- NEW REQUEST INITIATED (Groq) ---')

    // 1. IP Rate Limiting (Basic)
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip'
    const now = Date.now()
    const limitRecord = rateLimitMap.get(ip)

    if (limitRecord) {
        if (now - limitRecord.lastReset > RATE_LIMIT_WINDOW) {
            rateLimitMap.set(ip, { count: 1, lastReset: now })
        } else {
            limitRecord.count++
            if (limitRecord.count > RATE_LIMIT_MAX) {
                console.warn(`[elin-chat-error] Rate limit exceeded for IP: ${ip}`)
                return NextResponse.json(
                    { success: false, message: '', error: 'Too many requests. Please try again in a minute.' },
                    { status: 429 }
                )
            }
        }
    } else {
        rateLimitMap.set(ip, { count: 1, lastReset: now })
    }

    // 2. API Key Validation
    const rawKey = process.env.GROQ_API_KEY
    if (!rawKey) {
        console.error('[elin-chat-error] GROQ_API_KEY is missing or undefined.')
        return NextResponse.json(
            { success: false, message: '', error: 'AI service configuration error. Please contact support.' },
            { status: 500 }
        )
    }

    const groq = new Groq({ apiKey: rawKey.trim() })

    try {
        // 3. Body Validation
        const body = await request.json()
        const { message, history, difficulty } = body

        if (!message || typeof message !== 'string') {
            console.error('[elin-chat-error] Invalid prompt message')
            return NextResponse.json(
                { success: false, message: '', error: 'Valid message prompt is required.' },
                { status: 400 }
            )
        }

        const validDifficulty = difficulty || 'High Schooler'

        // 4. Memory Limiter (System + Last 2 turns + Current Message)
        const systemPrompt = `You are an 'Explain Like I'm New' Study Companion. 
The user wants to learn about a topic. You must explain it at the level of a ${validDifficulty}. 
Use highly relatable analogies, short bullet points, and avoid unexplained jargon. 
Keep answers structured and easy to read. Do not hallucinate.`

        const validHistory = Array.isArray(history) ? history : []

        // Take last 4 elements (2 user turns + 2 assistant turns = 2 full turns)
        const trimmedHistory = validHistory.slice(-4).map((h: any) => ({
            role: h.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: typeof h.content === 'string' ? h.content : '',
        }))

        // Final payload array
        const chatMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...trimmedHistory,
            { role: 'user' as const, content: message },
        ]

        console.log(`[elin-chat] Sending request to Groq API using difficulty: ${validDifficulty}`)

        // 5. Execute Groq Call with 15s Timeout using Promise.race
        const generatePromise = groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: chatMessages,
            max_tokens: 800,
            temperature: 0.7,
        })

        const timeoutPromise = new Promise<{ timeout: true }>((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        })

        const result = await Promise.race([generatePromise, timeoutPromise]) as any

        // 6. Safe Extraction
        const extractedText = result.choices?.[0]?.message?.content

        if (!extractedText) {
            console.error('[elin-chat-error] Empty response extracted from Groq.')
            return NextResponse.json(
                { success: false, message: '', error: 'The AI generated an empty response.' },
                { status: 500 }
            )
        }

        // 7. Return Structured JSON Success
        return NextResponse.json(
            { success: true, message: extractedText },
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error: any) {
        console.error('[elin-chat-error] Caught Exception in Backend:')
        const errorMessage = error.message || String(error)
        console.error(errorMessage)

        if (errorMessage === 'TIMEOUT' || error.name === 'AbortError') {
            return NextResponse.json(
                { success: false, message: '', error: 'Request timed out waiting for AI response.' },
                { status: 504 }
            )
        }

        return NextResponse.json(
            { success: false, message: '', error: 'An internal server error occurred while processing the request.' },
            { status: 500 }
        )
    }
}
