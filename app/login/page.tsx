'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { GraduationCap, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'anurag.edu.in'

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (!email.endsWith(`@${allowedDomain}`)) {
            setMessage({ type: 'error', text: `Only @${allowedDomain} emails are permitted.` })
            setLoading(false)
            return
        }

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Check your email! A magic link has been sent.' })
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md border-slate-700/50 bg-slate-800/80 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Welcome to Campus OS</CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in with your institutional email to access the campus platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={`your.name@${allowedDomain}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                        </div>

                        {message && (
                            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {message.type === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending magic link...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Send Magic Link <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-center text-slate-500">
                            🔒 Secured by institutional email verification. Only authorized university members can access Campus OS.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
