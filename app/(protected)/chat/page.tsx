'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Send,
    Bot,
    User,
    AlertCircle,
    Loader2,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sources?: { question: string; category: string }[]
}

export default function ChatPage() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [expandedSources, setExpandedSources] = useState<number | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        // Add placeholder assistant message
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
                console.error('Chat API error:', data?.error)
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
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
            {/* Disclaimer Banner */}
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>AI responses may be inaccurate. Verify critical information with the college office.</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Campus Buddy AI</h2>
                        <p className="text-slate-400 max-w-md mb-6">
                            Ask me anything about Anurag University — fee deadlines, exam schedules, HOD contacts, campus services, and more.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                            {[
                                'What is the last date to pay semester fees?',
                                'Who is the HOD of CSE?',
                                'What are the library timings?',
                                'How do I apply for a bonafide certificate?',
                            ].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); }}
                                    className="text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <Avatar className="w-8 h-8 shrink-0 mt-1">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                    <Bot className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                            <Card className={`p-3 ${msg.role === 'user'
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-800/80 border-slate-700/50 text-slate-200'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                {msg.content === '' && loading && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-xs">Thinking...</span>
                                    </div>
                                )}
                            </Card>
                            {/* Source Citations */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-1">
                                    <button
                                        onClick={() => setExpandedSources(expandedSources === i ? null : i)}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                                    >
                                        📚 {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} used
                                        {expandedSources === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                    {expandedSources === i && (
                                        <div className="mt-1 space-y-1">
                                            {msg.sources.map((src, j) => (
                                                <div key={j} className="flex items-center gap-2 text-xs text-slate-500 pl-2 border-l border-slate-700">
                                                    <Badge variant="secondary" className="text-[10px] h-5 bg-slate-700 text-slate-300">
                                                        {src.category}
                                                    </Badge>
                                                    <span className="truncate">{src.question}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <Avatar className="w-8 h-8 shrink-0 mt-1">
                                <AvatarFallback className="bg-slate-700 text-white text-xs">
                                    <User className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Campus Buddy anything..."
                        className="resize-none bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[48px] max-h-[120px]"
                        rows={1}
                        disabled={loading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
