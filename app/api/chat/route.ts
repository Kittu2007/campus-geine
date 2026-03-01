import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import campusInfo from '@/lib/university-context.json'

// Basic in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>()
const RATE_LIMIT_MAX = 30 // max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    console.log('[chat] --- NEW REQUEST INITIATED (Gemini) ---')

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
    const rawKey = process.env.GEMINI_API_KEY
    if (!rawKey) {
        console.error('[chat-error] GEMINI_API_KEY is missing or undefined.')
        return NextResponse.json(
            { success: false, message: '', error: 'AI service configuration error. Please contact support.' },
            { status: 500 }
        )
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(rawKey.trim())
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
        }
    })

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

        // 4. Construction of context & history
        const systemPrompt = `You are Campus Buddy, an AI assistant for Anurag University. 
Answer clearly and professionally. 
If information is not available in the provided context, say you do not have access to that specific data but suggest where they might find it (e.g., specific department or official website).
Do not hallucinate facts. 
Keep answers concise and helpful (under 150 words).

UNIVERSITY SPECIFIC KNOWLEDGE:
${JSON.stringify(campusInfo, null, 2)}`

        const validHistory = Array.isArray(history) ? history : []

        // Convert history to Gemini format (user -> user, assistant -> model)
        const chatHistory = validHistory.slice(-6).map((h: any) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof h.content === 'string' ? h.content : '' }],
        }))

        // 5. Execute Gemini Call
        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: systemPrompt,
        })

        const result = await chat.sendMessage(message)
        const responseText = result.response.text()

        if (!responseText) {
            console.error('[chat-error] Empty response from Gemini.')
            return NextResponse.json(
                { success: false, message: '', error: 'The AI generated an empty response.' },
                { status: 500 }
            )
        }

        // 6. Return Structured JSON Success
        return NextResponse.json(
            { success: true, message: responseText },
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error: any) {
        console.error('[chat-error] Caught Exception in Backend:', error)

        const errorMessage = error.message || String(error)

        // Handle specific Gemini errors if needed
        if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
            return NextResponse.json(
                { success: false, message: '', error: 'The request was blocked by safety filters. Please try rephrasing.' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, message: '', error: 'An internal server error occurred while processing the request.' },
            { status: 500 }
        )
    }
}
