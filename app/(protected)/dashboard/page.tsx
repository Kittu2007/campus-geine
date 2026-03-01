'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
    MessageSquare, AlertTriangle, BookOpen, Users, User, Sparkles, ArrowRight,
    TrendingUp, CheckCircle2, Clock
} from 'lucide-react'

// Animated Counter Component
function CountUp({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTimestamp: number | null = null
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }
        window.requestAnimationFrame(step)
    }, [end, duration])

    return <span>{count}{suffix}</span>
}

const modules = [
    { href: '/chat', label: 'FAQ Bot', desc: 'Instant campus information AI', icon: MessageSquare, color: 'bg-[#1E2B58]', iconColor: 'text-white' },
    { href: '/elin', label: 'ELIN AI', desc: 'Academic master educator', icon: Sparkles, color: 'bg-[#C62026]', iconColor: 'text-white' },
    { href: '/resources', label: 'Resources Hub', desc: 'Secure study material vault', icon: BookOpen, color: 'bg-[#1E2B58]', iconColor: 'text-white' },
    { href: '/complaints', label: 'Complaints', desc: 'Track infrastructure resolution', icon: AlertTriangle, color: 'bg-[#C62026]', iconColor: 'text-white' },
    { href: '/teams', label: 'Hackathon Teams', desc: 'Coordinate skill-based groups', icon: Users, color: 'bg-[#1E2B58]', iconColor: 'text-white' },
    { href: '/profile', label: 'My Identity', desc: 'Manage official credentials', icon: User, color: 'bg-slate-700', iconColor: 'text-white' },
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
        <div className="max-w-7xl mx-auto px-1 py-8 animate-slide-in">
            {/* Header Section */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-[#C62026]" />
                        Genie Dashboard
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter">
                        {greeting}, <span className="text-[#C62026]">{user?.email?.split('@')[0] || 'Student'}</span>
                    </h1>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-white border-[1.5px] border-slate-200/60 p-2 rounded-sm shadow-sm">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                        Active Now
                    </div>
                </div>
            </header>

            {/* Quick Stats / Data Drawing In */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 px-4">
                {[
                    { label: 'Academic Progress', value: 87, suffix: '%', icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Files Secured', value: 124, suffix: '', icon: BookOpen, color: 'text-[#1E2B58]' },
                    { label: 'Issues Resolved', value: 92, suffix: '%', icon: CheckCircle2, color: 'text-[#C62026]' },
                    { label: 'Response Time', value: 1.2, suffix: 's', icon: Clock, color: 'text-amber-500' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white border-[1.5px] border-slate-200/60 transition-all hover:border-[#1E2B58]/30">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-sm">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-[#1E2B58] tracking-tighter leading-none mt-1">
                                    <CountUp end={stat.value} duration={1500} suffix={stat.suffix} />
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Interlocking Module Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 px-4">
                {modules.map((mod, idx) => {
                    const Icon = mod.icon
                    return (
                        <Link key={idx} href={mod.href} className="group">
                            <div className="relative h-48 bg-white border border-slate-200/60 overflow-hidden transition-all duration-300 group-hover:z-10 group-hover:border-[#1E2B58]/50 group-hover:shadow-[0_10px_40px_rgba(30,43,88,0.1)]">
                                {/* Geometric Background Shape */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 translate-x-12 -translate-y-12 rotate-45 group-hover:scale-150 transition-transform duration-500" />

                                <CardContent className="h-full p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-sm ${mod.color} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                            <Icon className={`w-6 h-6 ${mod.iconColor}`} />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#C62026] group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <div>
                                        <h3 className="font-black text-[#1E2B58] text-xl tracking-tight uppercase mb-1">
                                            {mod.label}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {mod.desc}
                                        </p>
                                    </div>
                                </CardContent>

                                {/* Interactive Edge */}
                                <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-[#C62026] transition-all duration-500" />
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Announcement Section */}
            <div className="mt-12 px-4">
                <div className="bg-[#1E2B58] text-white p-1 rounded-sm overflow-hidden flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-[#C62026] p-8 md:p-12 text-center md:text-left min-w-[300px]">
                        <h2 className="text-2xl font-black uppercase tracking-tight italic">System Status</h2>
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest">Core Online</span>
                            </div>
                            <div className="w-px h-4 bg-white/20" />
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest">AI Calibrated</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 flex-1">
                        <p className="text-blue-100 font-medium leading-relaxed max-w-2xl text-sm md:text-base">
                            The Campus Genie operating system is fully operational. All modules (ELIN, FAQ, Resources) are synchronized with the 2024-25 academic foundation. Precise structure ensured via geometric architectural principles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 
