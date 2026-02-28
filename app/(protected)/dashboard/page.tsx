'use client'

import { useAuth } from '@/lib/firebase/AuthContext'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
    MessageSquare, AlertTriangle, BookOpen, Users, User, Sparkles,
} from 'lucide-react'

const modules = [
    { href: '/chat', label: 'Campus Buddy AI', desc: 'Ask questions about campus', icon: MessageSquare, color: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-500/20' },
    { href: '/complaints', label: 'Complaints', desc: 'Report infrastructure issues', icon: AlertTriangle, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-500/20' },
    { href: '/resources', label: 'Resources Hub', desc: 'Browse study materials', icon: BookOpen, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/20' },
    { href: '/teams', label: 'Hackathon Teams', desc: 'Find teammates', icon: Users, color: 'from-purple-500 to-pink-600', iconBg: 'bg-purple-500/20' },
    { href: '/profile/edit', label: 'My Profile', desc: 'Edit your profile', icon: User, color: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-500/20' },
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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-blue-400 font-medium">{greeting}</span>
                </div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome, {user?.email?.split('@')[0] || 'Student'} 👋
                </h1>
                <p className="text-slate-400 mt-1">What would you like to do today?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map(mod => {
                    const Icon = mod.icon
                    return (
                        <Link key={mod.href} href={mod.href}>
                            <Card className="h-full bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-xl ${mod.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white text-lg mb-1">{mod.label}</h3>
                                    <p className="text-sm text-slate-400">{mod.desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
