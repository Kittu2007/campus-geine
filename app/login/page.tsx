'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { GraduationCap, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const allowedDomain = 'anurag.edu.in'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        // Validate email domain
        if (!email.endsWith(`@${allowedDomain}`)) {
            setMessage({ type: 'error', text: `Only @${allowedDomain} emails are permitted.` })
            setLoading(false)
            return
        }

        // Validate password
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
            setLoading(false)
            return
        }

        // Validate confirm password for signup
        if (mode === 'signup' && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' })
            setLoading(false)
            return
        }

        const supabase = createClient()

        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else {
                setMessage({
                    type: 'success',
                    text: 'Account created! Check your email to verify your account, then sign in.',
                })
                setEmail('')
                setPassword('')
                setConfirmPassword('')
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else {
                router.push('/dashboard')
            }
        }

        setLoading(false)
    }

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin')
        setMessage(null)
        setPassword('')
        setConfirmPassword('')
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
                    <CardTitle className="text-2xl font-bold text-white">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        {mode === 'signin'
                            ? 'Sign in with your institutional credentials'
                            : 'Register with your university email to get started'}
                    </CardDescription>
                </CardHeader>

                {/* Mode Toggle Tabs */}
                <div className="px-6 mb-2">
                    <div className="flex bg-slate-700/50 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => { setMode('signin'); setMessage(null) }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signin'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('signup'); setMessage(null) }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signup'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
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

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password (signup only) */}
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Messages */}
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

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Switch mode link */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                        >
                            {mode === 'signin'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-center text-slate-500">
                            🔒 Only <span className="text-slate-400 font-medium">@{allowedDomain}</span> emails are accepted. Secured by institutional email verification.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
