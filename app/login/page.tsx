'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

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

        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)

                // Create profile in Supabase
                const supabase = createClient()
                await supabase.from('profiles').upsert({
                    id: userCredential.user.uid,
                    email: userCredential.user.email,
                    role: 'student',
                })

                setMessage({
                    type: 'success',
                    text: 'Account created successfully! Redirecting to dashboard...',
                })
                setTimeout(() => router.push('/dashboard'), 1500)
            } else {
                await signInWithEmailAndPassword(auth, email, password)
                router.push('/dashboard')
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string }
            let errorMessage = 'An error occurred. Please try again.'

            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered. Please sign in instead.'
                    break
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password.'
                    break
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email. Please sign up first.'
                    break
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters.'
                    break
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please try again later.'
                    break
                default:
                    errorMessage = firebaseError.message || errorMessage
            }

            setMessage({ type: 'error', text: errorMessage })
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800 relative overflow-hidden">
            {/* Geometric Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1E2B58]/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C62026]/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,43,88,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,43,88,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            <Card className="w-full max-w-md border-[1.5px] border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative z-10 rounded-sm animate-slide-in">
                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto flex flex-col items-center justify-center">
                        <img src="/anurag-logo.png" alt="Anurag University" className="w-16 h-16 object-contain mb-2" />
                        <h1 className="text-xl font-bold tracking-tight text-[#1E2B58]">Campus Genie</h1>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        {mode === 'signin'
                            ? 'Sign in with your institutional credentials'
                            : 'Register with your university email to get started'}
                    </CardDescription>
                </CardHeader>

                {/* Mode Toggle Tabs */}
                <div className="px-6 mb-4">
                    <div className="flex bg-slate-100 rounded-sm p-1 border border-slate-200/50">
                        <button type="button" onClick={() => { setMode('signin'); setMessage(null) }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${mode === 'signin' ? 'bg-white text-[#1E2B58] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            Sign In
                        </button>
                        <button type="button" onClick={() => { setMode('signup'); setMessage(null) }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${mode === 'signup' ? 'bg-white text-[#1E2B58] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            Sign Up
                        </button>
                    </div>
                </div>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 px-2">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#1E2B58] font-bold text-xs uppercase tracking-wider">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input id="email" type="email" placeholder={`your.name@${allowedDomain}`}
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#1E2B58] focus-visible:ring-1 focus-visible:border-[#1E2B58] focus-visible:ring-offset-0 transition-all duration-200 rounded-sm" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#1E2B58] font-bold text-xs uppercase tracking-wider">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#1E2B58] focus-visible:ring-1 focus-visible:border-[#1E2B58] focus-visible:ring-offset-0 transition-all duration-200 rounded-sm" required minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E2B58] transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[#1E2B58] font-bold text-xs uppercase tracking-wider">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#1E2B58] focus-visible:ring-1 focus-visible:border-[#1E2B58] focus-visible:ring-offset-0 transition-all duration-200 rounded-sm" required minLength={6} />
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className={`flex items-start gap-2 p-3 rounded-sm text-sm font-medium ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-[#1E2B58] hover:bg-[#151f42] text-white font-semibold transition-all duration-200 rounded-sm shadow-[0_4px_14px_0_rgba(30,43,88,0.39)] hover:shadow-[0_6px_20px_rgba(30,43,88,0.23)] hover:animate-pulse-interlock mt-4" disabled={loading}>
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

                    <div className="mt-6 text-center">
                        <button type="button" onClick={switchMode} className="text-sm font-medium text-slate-500 hover:text-[#C62026] transition-colors">
                            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
                        <p className="text-xs text-center text-slate-500">
                            🔒 Only <span className="text-[#1E2B58] font-bold">@{allowedDomain}</span> emails are accepted. Secured by Firebase.
                        </p>
                        <button type="button" onClick={() => router.push('/admin-login')} className="text-xs text-slate-400 hover:text-[#C62026] transition-colors mt-2">
                            Admin Portal Access
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
