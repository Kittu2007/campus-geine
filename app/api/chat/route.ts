import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import campusInfo from '@/lib/university-context.json'

// Ensure we don't cache this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    console.log('[chat] --- NEW REQUEST INITIATED ---')

    // 1. Environment Variable Validation
    const rawKey = process.env.GEMINI_API_KEY
    if (!rawKey) {
        console.error('[chat-error] GEMINI_API_KEY is missing or undefined.')
        return NextResponse.json(
            { success: false, message: '', error: 'AI service configuration error. Please contact support.' },
            { status: 500 }
        )
    }

    // Clean key of any stray whitespace/newlines from CLI injections
    const geminiKey = rawKey.replace(/\s/g, '')

    try {
        // 2. Body Validation
        const body = await request.json()
        const { message, history } = body

        if (!message || typeof message !== 'string') {
            console.error('[chat-error] Invalid or missing prompt in request body.')
            return NextResponse.json(
                { success: false, message: '', error: 'Valid message prompt is required.' },
                { status: 400 }
            )
        }

        console.log(`[chat] User prompt received: "${message.substring(0, 50)}..."`)

        // 3. Initialize Gemini
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash', // Using latest stable fast model
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
            }
        })

        // 4. Construct Prompt
        const systemPrompt = `You are Campus Buddy, the official AI assistant for Anurag University.

UNIVERSITY SPECIFIC KNOWLEDGE:
${JSON.stringify(campusInfo, null, 2)}

INSTRUCTIONS:
1. Always be helpful, polite, and professional.
2. If the user asks something not in the knowledge base, say you don't know but offer general university assistance.
3. Keep answers concise but complete.
4. Format responses in clean markdown.`

        // Format history for Gemini (needs entirely specific format or simple text block)
        // For simplicity and stability in this raw prompt format, we bundle history into the system prompt context.
        let conversationContext = systemPrompt + '\n\n--- PREVIOUS CONVERSATION ---\n'
        if (Array.isArray(history)) {
            history.slice(-6).forEach((h: any) => {
                if (h.role && h.content) {
                    conversationContext += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`
                }
            })
        }
        conversationContext += `\n--- CURRENT USER MESSAGE ---\nUser: ${message}\nAssistant: `

        // 5. 15s Timeout AbortController
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, 15000)

        console.log('[chat] Sending request to Gemini API...')

        // 6. Execute Gemini Call with Timeout
        // GoogleGenerativeAI SDK fetch doesn't directly expose AbortSignal elegantly in older versions, 
        // but it aborts if the global Node fetch signals. We wrap in a Promise race for safety.

        const generatePromise = model.generateContent(conversationContext)

        const timeoutPromise = new Promise<{ timeout: true }>((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        })

        const result = await Promise.race([generatePromise, timeoutPromise]) as any
        clearTimeout(timeoutId)

        // 7. Log Raw Response
        console.log('[chat] Gemini Raw Result:', JSON.stringify(result, null, 2).substring(0, 500) + '... [TRUNCATED]')

        // 8. Safe Extraction
        const responseData = result?.response
        const extractedText =
            responseData?.candidates?.[0]?.content?.parts
                ?.map((p: any) => p.text)
                ?.join(" ")

        if (!extractedText) {
            console.error('[chat-error] Safe extraction failed. No valid candidates found.')
            console.error('Raw problematic response:', JSON.stringify(responseData, null, 2))
            return NextResponse.json(
                { success: false, message: '', error: 'The AI generated an empty or blocked response.' },
                { status: 500 }
            )
        }

        console.log('[chat] Response extracted successfully. Length:', extractedText.length)

        // 9. Return Structured JSON Success
        return NextResponse.json(
            { success: true, message: extractedText },
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error: any) {
        // 10. Granular Error Logging & Handling
        console.error('[chat-error] Caught Exception in Backend:')

        const errorMessage = error.message || String(error)
        console.error(errorMessage)

        if (errorMessage === 'TIMEOUT') {
            return NextResponse.json(
                { success: false, message: '', error: 'Request timed out waiting for AI response. Please try again.' },
                { status: 504 }
            )
        }

        if (errorMessage.includes('API key not valid')) {
            return NextResponse.json(
                { success: false, message: '', error: 'AI service configuration error (Invalid Key).' },
                { status: 500 }
            )
        }

        // Return raw error temporarily for live production debugging
        return NextResponse.json(
            { success: false, message: '', error: `SERVER ERROR: ${errorMessage} | STACK: ${error?.stack}` },
            { status: 500 }
        )
    }
}
