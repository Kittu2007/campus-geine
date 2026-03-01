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
        { label: 'Total Complaints', value: complaintsCount || 0, icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-100', href: '/admin/complaints' },
        { label: 'Pending Complaints', value: pendingCount || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', href: '/admin/complaints?filter=pending' },
        { label: 'Total Resources', value: resourcesCount || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', href: '/admin/resources' },
        { label: 'Active Teams', value: teamsCount || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', href: '/admin/teams' },
    ]

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-sm flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
                    <p className="text-base text-slate-500 mt-1 font-medium">Manage and monitor the Campus Genie platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map(stat => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.label} href={stat.href} className="group block h-full">
                            <Card className="h-full bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 rounded-2xl overflow-hidden hover:border-slate-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>
                                    <p className="text-4xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                                    <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/complaints" className="group block h-full">
                    <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer p-6 rounded-2xl hover:border-red-300 hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">Manage Complaints</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">View, update status, and attach resolution proofs for student infrastructure complaints.</p>
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/admin/resources" className="group block h-full">
                    <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer p-6 rounded-2xl hover:border-emerald-300 hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <BookOpen className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">Manage Resources</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">Upload and categorize study materials, PDFs, web links, and AI prompts for students.</p>
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/admin/teams" className="group block h-full">
                    <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer p-6 rounded-2xl hover:border-indigo-300 hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">Moderate Teams</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">Review, moderate, and manage student hackathon team listings and active events.</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
