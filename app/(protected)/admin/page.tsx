import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, BookOpen, Users, ArrowRight, Shield } from 'lucide-react'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const [
        { count: complaintsCount },
        { count: pendingCount },
        { count: resourcesCount },
        { count: teamsCount },
    ] = await Promise.all([
        supabase.from('complaints').select('*', { count: 'exact', head: true }),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('hackathon_teams').select('*', { count: 'exact', head: true }),
    ])

    const stats = [
        { label: 'Total Complaints', value: complaintsCount || 0, icon: AlertTriangle, color: 'text-amber-400', href: '/admin/complaints' },
        { label: 'Pending Complaints', value: pendingCount || 0, icon: AlertTriangle, color: 'text-red-400', href: '/admin/complaints' },
        { label: 'Total Resources', value: resourcesCount || 0, icon: BookOpen, color: 'text-emerald-400', href: '/admin/resources' },
        { label: 'Active Teams', value: teamsCount || 0, icon: Users, color: 'text-purple-400', href: '/teams' },
    ]

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-sm text-slate-400">Manage your campus platform</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(stat => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.label} href={stat.href}>
                            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <Icon className={`w-5 h-5 ${stat.color}`} />
                                        <ArrowRight className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <p className="text-3xl font-bold text-white mt-3">{stat.value}</p>
                                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/complaints">
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition-all cursor-pointer p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Manage Complaints</h3>
                                <p className="text-sm text-slate-400">View, update, and resolve infrastructure complaints</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/admin/resources">
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30 transition-all cursor-pointer p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Manage Resources</h3>
                                <p className="text-sm text-slate-400">Upload and manage study materials for students</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
