'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { Button } from '@/components/ui/button'
import { Send, Bot, User, AlertCircle, Loader2, Copy, Check, Volume2 } from 'lucide-react'

// Message Structure
interface Message {
    role: 'user' | 'assistant'
    content: string
    isError?: boolean // Tracks if the message is actually a system error
}

const SUGGESTION_CHIPS = [
    'What is the last date to pay semester fees?',
    'Who is the HOD of CSE department?',
    'What are the library timings?',
    'How do I apply for a bonafide certificate?',
    'What is the minimum attendance requirement?',
    'How is CGPA calculated?',
]

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            title="Copy"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    )
}

function SpeakButton({ text }: { text: string }) {
    const [speaking, setSpeaking] = useState(false)
    const handleSpeak = () => {
        if (speaking) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
            return
        }
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setSpeaking(false)
        setSpeaking(true)
        window.speechSynthesis.speak(utterance)
    }
    return (
        <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg transition-all ${speaking ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            title={speaking ? 'Stop' : 'Read aloud'}
        >
            <Volume2 className="w-3.5 h-3.5" />
        </button>
    )
}

export default function ChatPage() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sendAnim, setSendAnim] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (text?: string) => {
        const userMessage = (text || input).trim()
        if (!userMessage || loading) return

        // 1. Reset UI State & Animations
        setInput('')
        setSendAnim(true)
        setTimeout(() => setSendAnim(false), 1500)

        // 2. Add user msg & placeholder bot msg
        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: '' }
        ]
        setMessages(newMessages)
        setLoading(true)

        try {
            const token = await user?.getIdToken()

            // 3. Keep memory precise for backend (Strip out system error messages)
            const cleanHistoryForBackend = messages.filter(m => !m.isError)

            // 4. Network Fetch against valid backend handler
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: cleanHistoryForBackend,
                }),
            })

            // 5. Strict JSON Parsing Logic (DO NOT CRASH ON FAILS)
            let data: any
            try {
                data = await response.json()
            } catch (parseError) {
                console.error('[chat-error] Non-JSON payload returned by Vercel/Node edge:', parseError)
                throw new Error('Server returned an unrecognizable response.')
            }

            // 6. Process Schema Response
            if (data && data.success === true) {
                // Success path
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: data.message || 'No response generated.',
                        isError: false
                    }
                    return updated
                })
            } else {
                // Known schema API Error (data.success === false)
                console.error(`[chat-error] API returned programmatic error:`, data?.error)
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: data?.error || 'The server encountered an issue. Please try again.',
                        isError: true
                    }
                    return updated
                })
            }

        } catch (err: any) {
            // 7. Hard Network Failures or Unhandled Exceptions
            console.error('[chat-error] Hard Client Network Exception:', err)

            const displayMessage = err.message || 'Unable to reach the AI service right now. Please check your network connection.'

            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: `NETWORK/CLIENT ERROR: ${displayMessage}`,
                    isError: true
                }
                return updated
            })
        } finally {
            setLoading(false)
            // Optional: return focus to input on desktop
            if (window.innerWidth > 768) {
                inputRef.current?.focus()
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Details */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl" />
            </div>

            {/* Disclaimer Bar */}
            <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs shrink-0 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>AI responses may be inaccurate. Verify critical information with the college office.</span>
            </div>

            {/* Chat Container */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 text-sm md:text-base">
                {messages.length === 0 ? (
                    /* Initial Welcome View */
                    <div className="flex flex-col items-center justify-center min-h-full text-center pb-32">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-md ring-4 ring-slate-100">
                            <Bot className="w-10 h-10 text-blue-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                            Hello! How can I help you today?
                        </h1>
                        <p className="text-slate-500 mb-10 text-base">
                            Ask me anything about Anurag University — I&apos;m here to assist!
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                            {SUGGESTION_CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => sendMessage(chip)}
                                    className="px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left font-medium shadow-sm active:scale-95"
                                >
                                    <span>{chip}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Active Chat View */
                    <div className="max-w-3xl mx-auto space-y-6 pb-32">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}

                                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className={`rounded-2xl px-5 py-3.5 leading-relaxed text-[15px] shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-sm'
                                        : msg.isError
                                            ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm font-medium'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                                        }`}>
                                        {msg.content === '' && loading && i === messages.length - 1 ? (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                                </div>
                                                <span className="text-xs font-medium">Genie is thinking...</span>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Action buttons (only show if not loading and not an error) */}
                                    {msg.role === 'assistant' && msg.content && !msg.isError && (
                                        <div className="flex items-center gap-1 ml-1 mt-1">
                                            <CopyButton text={msg.content} />
                                            <SpeakButton text={msg.content} />
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="w-4 h-4 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-6 bg-gradient-to-t from-slate-50 relative pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <div className="flex items-end gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value)
                                e.target.style.height = 'auto'
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Campus Genie anything..."
                            rows={1}
                            disabled={loading}
                            className="flex-1 bg-transparent border-none outline-none resize-none text-slate-800 placeholder:text-slate-400 px-3 py-2 min-h-[40px] max-h-[120px] leading-relaxed"
                            style={{ height: '40px' }}
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className={`shrink-0 w-10 h-10 rounded-xl p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${sendAnim ? 'send-anim' : ''}`}
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                : <Send className="w-4 h-4 text-white" />
                            }
                        </Button>
                    </div>
                    <div className="text-center mt-2 pb-1">
                        <span className="text-[10px] text-slate-400 pointer-events-auto">Campus Genie can make mistakes. Verify important information.</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes send-anim {
                    0% { transform: translate(0, 0); }
                    30% { transform: translate(8px, -8px); opacity: 0; }
                    60% { transform: translate(-8px, 8px); opacity: 0; }
                    100% { transform: translate(0, 0); opacity: 1; }
                }
                .send-anim { animation: send-anim 1.5s ease forwards; }
            `}</style>
        </div>
    )
}
