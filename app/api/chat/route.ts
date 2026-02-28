import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import campusInfo from '@/lib/university-context.json'

// Basic in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>()
const RATE_LIMIT_MAX = 20 // max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    console.log('[chat] --- NEW REQUEST INITIATED (OpenAI) ---')

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
                console.warn(`[chat-error] Rate limit exceeded for IP: ${ip}`)
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
    const rawKey = process.env.OPENAI_API_KEY
    if (!rawKey) {
        console.error('[chat-error] OPENAI_API_KEY is missing or undefined.')
        return NextResponse.json(
            { success: false, message: '', error: 'AI service configuration error. Please contact support.' },
            { status: 500 }
        )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: rawKey.trim() })

    try {
        // 3. Body Validation
        const body = await request.json()
        const { message, history } = body

        if (!message || typeof message !== 'string') {
            console.error('[chat-error] Invalid prompt message')
            return NextResponse.json(
                { success: false, message: '', error: 'Valid message prompt is required.' },
                { status: 400 }
            )
        }

        // 4. Memory Limiter (System + Last 2 turns + Current Message)
        const systemPrompt = `You are Campus Buddy, an AI assistant for Anurag University. 
Answer clearly and professionally. 
If information is not available, say you do not have access to that data.
Do not hallucinate. 
Keep answers under 150 words unless necessary.

UNIVERSITY SPECIFIC KNOWLEDGE:
${JSON.stringify(campusInfo, null, 2)}`

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

        console.log(`[chat] Sending request to OpenAI API (gpt-4o-mini). History turns included: ${trimmedHistory.length / 2}`)

        // 5. Execute OpenAI Call with 15s Timeout using Promise.race
        const generatePromise = openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: chatMessages,
            max_tokens: 500,
            temperature: 0.7,
        })

        const timeoutPromise = new Promise<{ timeout: true }>((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        })

        const result = await Promise.race([generatePromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion

        // 6. Log Raw Response for debugging
        console.log('[chat] OpenAI Raw Result:', JSON.stringify(result, null, 2).substring(0, 300) + '... [TRUNCATED]')

        // 7. Safe Extraction
        const extractedText = result.choices?.[0]?.message?.content

        if (!extractedText) {
            console.error('[chat-error] Empty response extracted from OpenAI.')
            return NextResponse.json(
                { success: false, message: '', error: 'The AI generated an empty response.' },
                { status: 500 }
            )
        }

        // 8. Return Structured JSON Success
        return NextResponse.json(
            { success: true, message: extractedText },
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error: any) {
        // 9. Granular Error Logging & Separation
        console.error('[chat-error] Caught Exception in Backend:')
        const errorMessage = error.message || String(error)
        console.error(errorMessage)

        // Separate: Timeout
        if (errorMessage === 'TIMEOUT' || error.name === 'AbortError') {
            return NextResponse.json(
                { success: false, message: '', error: 'Request timed out waiting for AI response.' },
                { status: 504 }
            )
        }

        // Separate: OpenAI API Errors
        if (error instanceof OpenAI.APIError) {
            console.error(`[chat-error] OpenAI API Error - Status: ${error.status}, Code: ${error.code}, Type: ${error.type}`)

            if (error.status === 401) {
                return NextResponse.json({ success: false, message: '', error: 'AI Authentication failed (Invalid API Key).' }, { status: 500 })
            } else if (error.status === 429) {
                return NextResponse.json({ success: false, message: '', error: 'OpenAI quota exceeded or rate limit reached.' }, { status: 429 })
            } else if (error.status && error.status >= 500) {
                return NextResponse.json({ success: false, message: '', error: 'OpenAI servers are currently experiencing issues.' }, { status: 502 })
            }
            return NextResponse.json({ success: false, message: '', error: `OpenAI API returned an error: ${error.message}` }, { status: 500 })
        }

        // Separate: JSON parsing, node network, general server logic failures
        return NextResponse.json(
            { success: false, message: '', error: 'An internal server error occurred while processing the request.' },
            { status: 500 }
        )
    }
}
