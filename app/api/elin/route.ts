import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Basic in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>()
const RATE_LIMIT_MAX = 50
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
    const rawKey = process.env.ELIN_GROQ_API_KEY
    if (!rawKey || rawKey.includes('your_elin')) {
        console.error('[elin-chat-error] ELIN_GROQ_API_KEY is missing, placeholder, or undefined.')
        return NextResponse.json(
            {
                success: false,
                message: '',
                error: 'AI service configuration error: ELIN_GROQ_API_KEY is missing in environment variables. Please add it to your Vercel project settings.'
            },
            { status: 500 }
        )
    }

    // Initialize Groq client
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

        // 4. Memory Limiter (System + Last turns + Current Message)
        const systemPrompt = `Act as a Master Educator specializing in the 'Explain Like I'm New' framework.

Context: The user needs to understand the requested topic.
Constraint: The explanation MUST be tailored to a ${validDifficulty} level.

Format your response exactly as follows:

The Big Picture: A 2-sentence summary of what the topic is.

The Analogy: Relate the topic to a common everyday experience (e.g., cooking, driving, shopping).

How It Works: 3 to 5 short bullet points explaining the mechanics, referencing your analogy.

Key Term: Introduce ONE essential piece of terminology related to this topic and define it simply.

Next Step: Ask a brief question to confirm the user grasped the concept.`

        const validHistory = Array.isArray(history) ? history : []

        // Take last 6 elements (3 turns)
        const trimmedHistory = validHistory.slice(-6).map((h: any) => ({
            role: (h.role === 'assistant' || h.role === 'model') ? 'assistant' as const : 'user' as const,
            content: typeof h.content === 'string' ? h.content : '',
        }))

        // Final payload array
        const chatMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...trimmedHistory,
            { role: 'user' as const, content: message },
        ]

        console.log(`[elin-chat] Sending request to Groq API using difficulty: ${validDifficulty}`)

        // 5. Execute Groq Call with 15s Timeout
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: chatMessages,
            max_tokens: 800,
            temperature: 0.6,
        }).catch(err => {
            console.error('[elin-chat-error] Groq API call failed:', err.message)
            throw err
        })

        // 6. Safe Extraction
        const extractedText = completion.choices?.[0]?.message?.content

        if (!extractedText) {
            console.error('[elin-chat-error] Empty response from Groq.')
            return NextResponse.json(
                { success: false, message: '', error: 'The AI generated an empty response. Please try again.' },
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
        console.error('[elin-chat-error] Caught Exception in Backend:', error)
        const errorMessage = error.message || String(error)

        if (errorMessage.includes('api_key')) {
            return NextResponse.json(
                { success: false, message: '', error: 'Invalid Groq API Key for ELIN. Please check your credentials.' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                message: '',
                error: `Backend Error (ELIN): ${errorMessage.substring(0, 100)}...`
            },
            { status: 500 }
        )
    }
}
