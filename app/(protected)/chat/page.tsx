'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Send,
    Bot,
    User,
    AlertCircle,
    Loader2,
    Copy,
    Check,
    Volume2,
} from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sources?: { question: string; category: string }[]
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
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
            title="Copy"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
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
            className={`p-1.5 rounded-lg transition-all ${speaking ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}`}
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text?: string) => {
        const userMessage = (text || input).trim()
        if (!userMessage || loading) return

        setInput('')
        setSendAnim(true)
        setTimeout(() => setSendAnim(false), 1500)

        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)
        // Placeholder assistant bubble
        setMessages(prev => [...prev, { role: 'assistant', content: '' }])

        try {
            const token = await user?.getIdToken()
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10),
                }),
            })

            const data = await response.json()
            console.log('Chat API full response:', data)

            if (data?.success) {
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: data.message || 'No response generated.',
                        sources: data.sources || [],
                    }
                    return updated
                })
            } else {
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: data?.error || 'Something went wrong. Please try again.',
                    }
                    return updated
                })
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: 'Unable to reach the AI service. Please check your connection and try again.',
                }
                return updated
            })
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0d1117] relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
            </div>

            {/* Disclaimer */}
            <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs shrink-0">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>AI responses may be inaccurate. Verify critical information with the college office.</span>
            </div>

            {/* Messages area */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
                    /* Landing / Welcome State */
                    <div className="flex flex-col items-center justify-center min-h-full text-center pb-32">
                        {/* Bot avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 ring-1 ring-white/10">
                            <Bot className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            Hello! How can I help you today?
                        </h1>
                        <p className="text-slate-400 mb-10 text-base">
                            Ask me anything about Anurag University — I&apos;m here to assist!
                        </p>

                        {/* Suggestion chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                            {SUGGESTION_CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => sendMessage(chip)}
                                    className="px-5 py-3.5 rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm text-sm text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-slate-700/50 transition-all duration-200 text-left font-medium group"
                                >
                                    <span className="group-hover:text-blue-300 transition-colors">{chip}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat messages */
                    <div className="max-w-3xl mx-auto space-y-6 pb-32">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-800/70 border border-slate-700/50 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                                        }`}>
                                        {msg.content === '' && loading && i === messages.length - 1 ? (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                                </div>
                                                <span className="text-xs">Thinking...</span>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Action buttons for assistant messages */}
                                    {msg.role === 'assistant' && msg.content && (
                                        <div className="flex items-center gap-1 ml-1">
                                            <CopyButton text={msg.content} />
                                            <SpeakButton text={msg.content} />
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="flex items-center gap-1 ml-2">
                                                    {msg.sources.slice(0, 2).map((src, j) => (
                                                        <Badge key={j} variant="secondary"
                                                            className="text-[10px] h-4 bg-slate-800 text-slate-400 border-slate-700">
                                                            {src.category}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="w-4 h-4 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Floating Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-6 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/95 to-transparent">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl shadow-black/50">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value)
                                e.target.style.height = 'auto'
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Campus Buddy anything..."
                            rows={1}
                            disabled={loading}
                            className="flex-1 bg-transparent border-none outline-none resize-none text-white placeholder:text-slate-500 text-sm px-2 py-2 min-h-[40px] max-h-[120px] leading-relaxed"
                            style={{ height: '40px' }}
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className={`shrink-0 w-10 h-10 rounded-xl p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${sendAnim ? 'send-anim' : ''}`}
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Send className="w-4 h-4" />
                            }
                        </Button>
                    </div>
                    <p className="text-center text-slate-600 text-xs mt-2">
                        Campus Buddy · Powered by Anurag University knowledge base
                    </p>
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
