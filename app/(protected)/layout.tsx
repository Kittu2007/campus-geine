'use client'

import { useAuth } from '@/lib/firebase/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!user) {
        return null // AuthContext redirects to /login
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-800">
            <Navbar />
            <main className="pt-16 pb-20 md:pb-4">
                {children}
            </main>
        </div>
    )
}
