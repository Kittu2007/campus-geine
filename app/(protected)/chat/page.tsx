'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { Button } from '@/components/ui/button'
import { Send, Bot, User, AlertCircle, Loader2, Copy, Check, Volume2, Sparkles, MessageSquare } from 'lucide-react'

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
    'What is the attendance requirement?',
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
            className="p-1.5 rounded-sm text-slate-400 hover:text-[#1E2B58] hover:bg-slate-100 transition-all"
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
            className={`p-1.5 rounded-sm transition-all ${speaking ? 'text-[#C62026] bg-red-50' : 'text-slate-400 hover:text-[#1E2B58] hover:bg-slate-100'}`}
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

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (text?: string) => {
        const userMessage = (text || input).trim()
        if (!userMessage || loading) return

        setInput('')

        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: '' }
        ]
        setMessages(newMessages)
        setLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Server error')

            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: data.message }
                return updated
            })
        } catch (error: any) {
            console.error('Chat error:', error)
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: error.message || "I encountered a problem connecting to the server. Please try again.",
                    isError: true
                }
                return updated
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] max-w-5xl mx-auto animate-slide-in">
            {/* Header Area */}
            <div className="flex items-center justify-between p-4 md:px-6 bg-white border-b-[1.5px] border-slate-200/60 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#1E2B58] flex items-center justify-center shadow-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-lg text-[#1E2B58] tracking-tight uppercase leading-none">FAQ Bot</h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Campus Intelligence Unit</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,43,88,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(30,43,88,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12">
                        <div className="w-16 h-16 rounded-sm bg-slate-50 flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
                            <Bot className="w-8 h-8 text-[#1E2B58]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#1E2B58] tracking-tighter mb-2 italic">INITIALIZING CONNECTIVITY...</h2>
                        <p className="text-slate-500 font-medium mb-10 text-sm">
                            Ask me anything about Anurag University academic calendar, faculty, infrastructure, or administration policies.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full animate-slide-in">
                            {SUGGESTION_CHIPS.map(chip => (
                                <button
                                    key={chip}
                                    onClick={() => sendMessage(chip)}
                                    className="p-4 text-left text-xs font-bold bg-white border border-slate-200/60 rounded-sm hover:border-[#C62026] hover:bg-red-50/30 transition-all group flex items-center justify-between"
                                >
                                    <span className="text-slate-600 transition-colors group-hover:text-[#1E2B58]">{chip}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#C62026]" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <div key={idx} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-[#1E2B58]' : 'bg-[#C62026]'
                                }`}>
                                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>

                            <div className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-4 border-[1.5px] rounded-sm shadow-sm transition-all duration-300 ${m.role === 'user'
                                    ? 'bg-[#1E2B58] text-white border-[#1E2B58]'
                                    : m.isError
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-white text-slate-800 border-slate-200/60'
                                }`}>
                                {m.content ? (
                                    <div className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap tracking-tight">
                                        {m.content}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 h-5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C62026] animate-bounce" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C62026] animate-bounce delay-150" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C62026] animate-bounce delay-300" />
                                    </div>
                                )}

                                {m.role === 'assistant' && m.content && !m.isError && (
                                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100">
                                        <CopyButton text={m.content} />
                                        <SpeakButton text={m.content} />
                                    </div>
                                )}

                                {m.role === 'user' && (
                                    <div className="absolute top-1/2 -right-1 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#1E2B58] rotate-45 hidden md:block" />
                                )}
                                {m.role === 'assistant' && (
                                    <div className="absolute top-1/2 -left-1 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l-[1.5px] border-b-[1.5px] border-slate-200/60 rotate-45 hidden md:block" />
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-6 bg-white border-t-[1.5px] border-slate-200/60">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                    className="relative flex items-end gap-3 max-w-4xl mx-auto"
                >
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    sendMessage()
                                }
                            }}
                            placeholder="Type your campus query..."
                            rows={1}
                            className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-sm px-4 py-3 pr-12 text-[14px] font-medium transition-all focus:bg-white focus:border-[#1E2B58] focus:ring-1 focus:ring-[#1E2B58] outline-none min-h-[48px] max-h-32 resize-none"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-[#1E2B58] hover:bg-[#151f42] h-[48px] w-[48px] p-0 rounded-sm shrink-0 shadow-lg hover:animate-pulse-interlock"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
                <div className="mt-3 text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C62026]" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Genie Neural Network Connected</span>
                </div>
            </div>
        </div>
    )
} 
