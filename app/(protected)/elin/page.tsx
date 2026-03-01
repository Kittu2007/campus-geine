'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Send, User, RefreshCcw, AlertCircle, Sparkles, Binary } from 'lucide-react'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
}

const DIFFICULTIES = ['5-year-old', 'High Schooler', 'College Freshman']

export default function ElinCompanionPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [difficulty, setDifficulty] = useState('High Schooler')
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initial Welcome Message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: "🧠 **Genie Master Educator | ELIN Framework**\n\nAsk about any complex topic—I'll explain it in simple terms, using analogies and clear structural mechanics tailored specifically to your chosen difficulty level."
                }
            ])
        }
    }, [messages.length])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setError(null)

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage
        }

        setMessages(prev => [...prev, newMessage])
        setIsLoading(true)

        try {
            const response = await fetch('/api/elin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    difficulty: difficulty,
                    history: messages
                        .filter(m => m.id !== 'welcome')
                        .map(m => ({ role: m.role, content: m.content }))
                })
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to get response')
            }

            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.message
                }
            ])
        } catch (err: any) {
            console.error('Elin Chat Error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const resetChat = () => {
        setMessages([])
        setError(null)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] max-w-6xl mx-auto animate-slide-in">
            {/* Header / Control Area */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 md:px-8 border-b-[1.5px] bg-white border-slate-200 z-20 shrink-0 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-sm bg-[#C62026] flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-lg text-[#1E2B58] tracking-tight uppercase leading-none">ELIN Companion</h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Advanced Academic Logic</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="w-[160px] md:w-[180px] bg-white border-slate-200 focus:ring-[#1E2B58] h-10 font-bold uppercase tracking-wider text-[10px] shadow-sm rounded-sm transition-all hover:bg-slate-50">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 shadow-xl rounded-sm">
                            {DIFFICULTIES.map(level => (
                                <SelectItem key={level} value={level} className="cursor-pointer font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 focus:bg-red-50 transition-colors">
                                    {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={resetChat}
                        title="Reset Logic Engine"
                        className="text-slate-400 hover:text-[#C62026] hover:bg-red-50 hover:border-red-200 h-10 w-10 rounded-sm shrink-0 transition-all bg-white shadow-sm border-slate-200"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,43,88,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(30,43,88,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-start gap-3 md:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-sm bg-[#C62026] flex flex-shrink-0 items-center justify-center shadow-md mt-1">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div
                                className={`px-5 py-4 max-w-[85%] sm:max-w-[75%] shadow-sm leading-relaxed text-[14px] md:text-[15px] border-[1.5px] rounded-sm transition-all duration-300 ${message.role === 'user'
                                    ? 'bg-[#1E2B58] text-white border-[#1E2B58]'
                                    : 'bg-white text-slate-800 border-slate-200/60 shadow-md'
                                    }`}
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                <div className="font-medium tracking-tight">
                                    {message.content}
                                </div>
                            </div>

                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-sm bg-[#1E2B58] flex flex-shrink-0 items-center justify-center shadow-sm mt-1">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-8 h-8 rounded-sm bg-[#C62026] flex flex-shrink-0 items-center justify-center shadow-md mt-1">
                                <Binary className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div className="px-5 py-4 bg-white border border-slate-200 shadow-md rounded-sm flex items-center gap-1.5 h-[52px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1E2B58] animate-bounce" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1E2B58] animate-bounce delay-150" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1E2B58] animate-bounce delay-300" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-sm border border-red-200 shadow-sm max-w-2xl mx-auto my-4 text-sm font-bold uppercase tracking-tight">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-200 z-20">
                <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto relative group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Explain Neural Networks, Cell Biology, or the Stock Market..."
                        className="flex-1 rounded-sm border-[1.5px] border-slate-300 bg-white focus-visible:ring-[#1E2B58] focus-visible:border-[#1E2B58] h-14 md:h-16 shadow-inner pr-16 text-[14px] md:text-[15px] font-medium transition-all group-hover:border-[#C62026]"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-sm bg-[#1E2B58] hover:bg-[#151f42] h-12 w-12 px-0 shadow-lg transition-all absolute right-2 top-1/2 -translate-y-1/2 text-white disabled:opacity-50 hover:animate-pulse-interlock"
                    >
                        <Send className="w-5 h-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
                <div className="text-center mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                    Master Educator Mode Active • Neural Core Calibrated
                </div>
            </div>
        </div>
    )
} 
