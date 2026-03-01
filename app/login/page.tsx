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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 font-sans text-slate-800">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl relative z-10 rounded-2xl">
                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto flex flex-col items-center justify-center">
                        <img src="/anurag-logo.png" alt="Anurag University" className="w-16 h-16 object-contain mb-2" />
                        <h1 className="text-xl font-bold tracking-tight text-blue-900">Campus Genie</h1>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        {mode === 'signin'
                            ? 'Sign in with your institutional credentials'
                            : 'Register with your university email to get started'}
                    </CardDescription>
                </CardHeader>

                {/* Mode Toggle Tabs */}
                <div className="px-6 mb-2">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button type="button" onClick={() => { setMode('signin'); setMessage(null) }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'signin' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            Sign In
                        </button>
                        <button type="button" onClick={() => { setMode('signup'); setMessage(null) }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'signup' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            Sign Up
                        </button>
                    </div>
                </div>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input id="email" type="email" placeholder={`your.name@${allowedDomain}`}
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-200" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-200" required minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-200" required minLength={6} />
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm font-medium ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-200 rounded-lg shadow-sm hover:shadow-md" disabled={loading}>
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
                        <button type="button" onClick={switchMode} className="text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors">
                            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
                        <p className="text-xs text-center text-slate-500">
                            🔒 Only <span className="text-slate-600 font-semibold">@{allowedDomain}</span> emails are accepted. Secured by Firebase Authentication.
                        </p>
                        <button type="button" onClick={() => router.push('/admin-login')} className="text-xs text-slate-400 hover:text-blue-600 transition-colors mt-2">
                            Admin Portal Access
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
