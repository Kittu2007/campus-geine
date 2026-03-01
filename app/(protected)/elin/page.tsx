'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Send, User, RefreshCcw, AlertCircle } from 'lucide-react'

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
                    content: "🧠 **Explain Like I'm New**\n\nAsk about any complex topic—I'll explain it in simple terms, using analogies and clear language suited to your chosen level."
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
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header / Sidebar Control Area */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 md:px-8 border-b bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm z-10 shrink-0 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center border border-indigo-200 shadow-sm shrink-0">
                        <Brain className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-tight">Elin Study Companion</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">Explain Like I'm New</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="w-[160px] md:w-[180px] bg-white border-slate-200 focus:ring-indigo-500 h-9 font-medium shadow-sm transition-all text-sm hover:bg-slate-50">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 shadow-lg">
                            {DIFFICULTIES.map(level => (
                                <SelectItem key={level} value={level} className="cursor-pointer font-medium hover:bg-indigo-50 focus:bg-indigo-50 transition-colors">
                                    {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={resetChat}
                        title="Clear Chat"
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 h-9 w-9 rounded-lg shrink-0 transition-all bg-white shadow-sm"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth pb-32 w-full max-w-4xl mx-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 md:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-shrink-0 items-center justify-center shadow-md border border-indigo-900 mt-1">
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div
                            className={`px-4 md:px-5 py-3 md:py-4 max-w-[85%] sm:max-w-[75%] shadow-sm leading-relaxed text-[14px] md:text-[15px] ${message.role === 'user'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm shadow-md'
                                : 'bg-white text-slate-800 border border-slate-200 shadow-md rounded-2xl rounded-tl-sm'
                                }`}
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            {message.content}
                        </div>

                        {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex flex-shrink-0 items-center justify-center shadow-sm border border-slate-300 mt-1">
                                <User className="w-4 h-4 text-slate-600" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-shrink-0 items-center justify-center shadow-md border border-indigo-900 animate-pulse mt-1">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="px-5 py-4 bg-white border border-slate-200 shadow-md rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_0ms]" />
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_150ms]" />
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_300ms]" />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm max-w-2xl mx-auto my-4 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10 sticky bottom-0 left-0 right-0 lg:bottom-4 lg:mb-4 lg:mx-auto lg:rounded-2xl lg:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:max-w-4xl lg:border lg:left-0 lg:right-0 w-full transition-all">
                <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto relative group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="E.g., Explain Ensemble Learning, Jacobians, or Pointers in C..."
                        className="flex-1 rounded-xl border-slate-300 bg-white focus-visible:ring-indigo-500 h-12 md:h-14 shadow-sm pr-14 text-[14px] md:text-[15px] transition-all group-hover:border-indigo-300"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 h-10 w-10 md:h-12 md:w-12 px-0 shadow-md shadow-indigo-200/50 transition-all font-semibold flex-shrink-0 absolute right-1 top-1 text-white disabled:opacity-50"
                    >
                        <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                    Powered by Groq • Elin Study Companion
                </div>
            </div>
        </div>
    )
}
