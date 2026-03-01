'use client'

import { useAuth } from '@/lib/firebase/AuthContext'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
    MessageSquare, AlertTriangle, BookOpen, Users, User, Sparkles, ArrowRight
} from 'lucide-react'

const modules = [
    { href: '/chat', label: 'Campus Buddy AI', desc: 'Ask questions about campus', icon: MessageSquare, color: 'from-blue-600 to-indigo-600', iconText: 'text-blue-600', iconBg: 'bg-blue-100' },
    { href: '/resources', label: 'Resources Hub', desc: 'Browse study materials', icon: BookOpen, color: 'from-emerald-500 to-teal-600', iconText: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    { href: '/complaints', label: 'Complaints', desc: 'Report infrastructure issues', icon: AlertTriangle, color: 'from-red-500 to-orange-600', iconText: 'text-red-600', iconBg: 'bg-red-100' },
    { href: '/teams', label: 'Hackathon Teams', desc: 'Find teammates', icon: Users, color: 'from-indigo-500 to-purple-600', iconText: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    { href: '/profile/edit', label: 'My Profile', desc: 'Edit your profile', icon: User, color: 'from-slate-500 to-blue-600', iconText: 'text-slate-600', iconBg: 'bg-slate-100' },
]

export default function DashboardPage() {
    const { user } = useAuth()

    const greeting = (() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    })()

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            {/* Welcome Banner Card */}
            <div className="mb-10 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-8 sm:p-10 shadow-lg relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-100" />
                        <span className="text-sm text-blue-50 font-medium">{greeting}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                        Welcome to Campus Genie
                    </h1>
                    <p className="text-blue-100 text-lg max-w-xl">
                        Hello {user?.email?.split('@')[0] || 'Student'}. Choose a module below to get started with your campus tasks today.
                    </p>
                </div>
            </div>

            {/* Grid layout cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(mod => {
                    const Icon = mod.icon
                    return (
                        <Link key={mod.href} href={mod.href}>
                            <Card className="h-full bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:scale-[1.02] cursor-pointer group rounded-2xl overflow-hidden">
                                <CardContent className="p-6 relative">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-14 h-14 rounded-xl ${mod.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 ease-in-out shadow-sm`}>
                                            <Icon className={`w-7 h-7 ${mod.iconText}`} />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-xl mb-1.5">{mod.label}</h3>
                                    <p className="text-base text-slate-500">{mod.desc}</p>
                                </CardContent>
                                {/* Subtle bottom border gradient on hover */}
                                <div className={`h-1 w-full bg-gradient-to-r ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
