import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    MessageCircle,
    AlertTriangle,
    BookOpen,
    Users,
    User,
    ArrowRight,
    TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const quickLinks = [
    {
        href: '/chat',
        icon: MessageCircle,
        title: 'Campus Buddy AI',
        description: 'Ask any campus question',
        color: 'from-blue-500 to-cyan-500',
        bgHover: 'hover:border-blue-500/30',
    },
    {
        href: '/complaints',
        icon: AlertTriangle,
        title: 'Report Issue',
        description: 'Submit a complaint',
        color: 'from-amber-500 to-orange-500',
        bgHover: 'hover:border-amber-500/30',
    },
    {
        href: '/resources',
        icon: BookOpen,
        title: 'Resources',
        description: 'Browse study materials',
        color: 'from-emerald-500 to-teal-500',
        bgHover: 'hover:border-emerald-500/30',
    },
    {
        href: '/teams',
        icon: Users,
        title: 'Find Teams',
        description: 'Join a hackathon team',
        color: 'from-purple-500 to-pink-500',
        bgHover: 'hover:border-purple-500/30',
    },
    {
        href: '/profile/edit',
        icon: User,
        title: 'My Profile',
        description: 'Update your profile',
        color: 'from-indigo-500 to-blue-500',
        bgHover: 'hover:border-indigo-500/30',
    },
]

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user?.id || '')
        .single()

    const firstName = profile?.display_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Student'

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{firstName}</span> 👋
                </h1>
                <p className="text-slate-400">
                    Here&apos;s your Campus OS dashboard. Jump into any module to get started.
                </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {quickLinks.map((link) => {
                    const Icon = link.icon
                    return (
                        <Link key={link.href} href={link.href}>
                            <Card className={`bg-slate-800/50 border-slate-700/50 ${link.bgHover} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full`}>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white">{link.title}</h3>
                                        <p className="text-sm text-slate-400">{link.description}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Stats preview */}
            <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Platform Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400 text-sm">
                        Campus OS is your unified platform for everything campus-related.
                        Start by exploring the modules above or chatting with Campus Buddy AI for instant answers.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
