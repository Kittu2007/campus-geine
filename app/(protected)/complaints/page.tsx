'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertTriangle, Clock, CheckCircle2, WrenchIcon, ArrowRight, ShieldAlert } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; border: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-100', border: 'border-l-amber-500', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-[#1E2B58]/5 text-[#1E2B58] border-[#1E2B58]/10', border: 'border-l-[#1E2B58]', icon: WrenchIcon },
    resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', border: 'border-l-emerald-600', icon: CheckCircle2 },
}

interface Complaint {
    id: string
    category: string
    room_no: string
    description: string
    status: string
    image_url: string | null
    admin_notes: string | null
    resolution_image_url: string | null
    created_at: string
}

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false })

        setComplaints(data || [])
        setLoading(false)
    }

    return (
        <div className="max-w-5xl mx-auto px-1 py-8 animate-slide-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-[#C62026]" />
                        Operations Feedback
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter uppercase">
                        Infrastructure <span className="text-[#C62026]">Log</span>
                    </h1>
                </div>
                <Link href="/complaints/new">
                    <Button className="bg-[#1E2B58] hover:bg-[#151f42] text-white px-8 h-14 rounded-sm shadow-xl hover:animate-pulse-interlock flex items-center gap-2 uppercase font-black tracking-widest text-xs">
                        <Plus className="w-5 h-5" /> Report Anomaly
                    </Button>
                </Link>
            </div>

            {/* Matrix View */}
            <div className="px-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32 w-full bg-slate-100 rounded-sm" />
                        ))}
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="py-20 text-center border-[1.5px] border-dashed border-slate-200 bg-slate-50/50 rounded-sm">
                        <div className="w-16 h-16 rounded-sm bg-white border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShieldAlert className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-[#1E2B58] tracking-tighter uppercase mb-2 italic">Clean Registry</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active infrastructure complaints in your sector</p>
                    </div>
                ) : (
                    <div className="space-y-px bg-slate-100 border border-slate-200 overflow-hidden">
                        {complaints.map(complaint => {
                            const status = statusConfig[complaint.status] || statusConfig.pending
                            const StatusIcon = status.icon
                            return (
                                <Card key={complaint.id} className={`bg-white border-none rounded-none shadow-none group relative overflow-hidden transition-all duration-300 border-l-[6px] ${status.border.replace('border-l-', 'border-')}`}>
                                    <CardContent className="p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest rounded-sm">
                                                        {complaint.category.replace('_', ' ')}
                                                    </span>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-sm ${status.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-black text-[#1E2B58] tracking-tight uppercase group-hover:text-[#C62026] transition-colors mb-2">
                                                    Room {complaint.room_no} • Internal Log
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-3xl">
                                                    {complaint.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-4 shrink-0">
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                    {new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <Link href={`/complaints/${complaint.id}`}>
                                                    <Button variant="outline" className="h-10 px-6 rounded-sm border-slate-200 text-[#1E2B58] hover:border-[#C62026] hover:text-[#C62026] uppercase font-black tracking-widest text-[10px]">
                                                        Details <ArrowRight className="w-3 h-3 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Geometric Hover Accent */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 translate-x-12 -translate-y-12 rotate-45 group-hover:scale-110 transition-transform duration-500 pointer-events-none opacity-50" />
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* System Note */}
            <div className="mt-12 px-4">
                <div className="bg-[#1E2B58] text-white p-6 rounded-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-[#C62026] flex items-center justify-center shadow-lg">
                            <WrenchIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Maintenance Sync Active</p>
                            <p className="text-[10px] font-medium text-blue-200 mt-1 uppercase tracking-widest">All reports are routed to administration core</p>
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-white/10" />
                    <div className="hidden md:block">
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest text-right">Anurag University • System V2.4</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 
