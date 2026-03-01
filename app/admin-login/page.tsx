'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
            setLoading(false)
            return
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            // Verify admin role in Supabase
            const supabase = createClient()
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', uid)
                .single()

            if (error || !profile || profile.role !== 'admin') {
                // Not an admin, sign them out immediately
                await signOut(auth)
                setMessage({ type: 'error', text: 'Access Denied: You do not have administrator privileges.' })
                setLoading(false)
                return
            }

            // Success! Redirect to admin dashboard
            router.push('/admin')
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string }
            let errorMessage = 'An error occurred. Please try again.'

            switch (firebaseError.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password.'
                    break
                case 'auth/user-not-found':
                    errorMessage = 'No admin account found with this email.'
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-800 shadow-sm z-50">
                <Home className="w-4 h-4" />
                <span>Home</span>
            </Link>

            <Card className="w-full max-w-md border-slate-700/50 bg-slate-800/80 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Admin Portal
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in to manage Campus OS resources
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input id="email" type="email" placeholder="admin@domain.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" required minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{message.text}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-500/25 mt-2" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Access Portal <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-center">
                        <Button variant="link" onClick={() => router.push('/login')} className="text-sm text-slate-400 hover:text-white">
                            Student Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
