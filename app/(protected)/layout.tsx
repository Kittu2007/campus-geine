'use client'

import { useAuth } from '@/lib/firebase/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
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
        <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-x-hidden flex">
            {/* Subtle Geometric Heartbeat Pattern */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-100/30 blur-[80px] animate-heartbeat mix-blend-multiply" />
            </div>

            <Sidebar />
            <Navbar />
            <main className="flex-1 transition-all duration-300 md:ml-64 pt-16 md:pt-6 pb-20 md:pb-6 px-4 md:px-8 relative z-10 w-full animate-slide-in">
                {children}
            </main>
        </div>
    )
}
