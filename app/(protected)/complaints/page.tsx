'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertTriangle, Clock, CheckCircle2, WrenchIcon } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; border: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-l-amber-500', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', border: 'border-l-blue-500', icon: WrenchIcon },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200', border: 'border-l-green-600', icon: CheckCircle2 },
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
        <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        My Complaints
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">Track your infrastructure complaints and maintenance requests</p>
                </div>
                <Link href="/complaints/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:scale-105 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> New Complaint
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-32 w-full bg-slate-100 rounded-xl" />
                    ))}
                </div>
            ) : complaints.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200 border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <AlertTriangle className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No complaints yet</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-sm">You haven&apos;t submitted any infrastructure complaints. If you notice any issues around campus, report them here.</p>
                        <Link href="/complaints/new">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Submit Your First Complaint</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {complaints.map(complaint => {
                        const status = statusConfig[complaint.status] || statusConfig.pending
                        const StatusIcon = status.icon
                        return (
                            <Card key={complaint.id} className={`bg-white border-y border-r border-slate-200 border-l-4 ${status.border} shadow-sm hover:shadow-md transition-all duration-200 ease-in-out group overflow-hidden rounded-xl`}>
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="capitalize text-xs text-slate-600 border-slate-300 bg-slate-50 font-medium tracking-wide">
                                                    {complaint.category.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Room {complaint.room_no}</span>
                                            </div>
                                            <p className="text-base text-slate-800 line-clamp-2 md:line-clamp-none font-medium mt-1 leading-relaxed">{complaint.description}</p>
                                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                                Submitted on {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>

                                            {complaint.admin_notes && (
                                                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                        <img src="/anurag-logo.png" alt="Admin" className="w-3.5 h-3.5 object-contain opacity-60" />
                                                        Admin Response
                                                    </p>
                                                    <p className="text-sm text-slate-700 font-medium">{complaint.admin_notes}</p>
                                                </div>
                                            )}

                                            {(complaint.image_url || complaint.resolution_image_url) && (
                                                <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                    {complaint.image_url && (
                                                        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group-hover:border-slate-300 transition-colors">
                                                            <img src={complaint.image_url} alt="Issue" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                            <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 text-[10px] sm:text-xs text-center text-white py-1 font-medium backdrop-blur-sm">Reported Issue</div>
                                                        </div>
                                                    )}
                                                    {complaint.resolution_image_url && (
                                                        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-green-50 border border-green-200 relative group-hover:border-green-300 transition-colors">
                                                            <img src={complaint.resolution_image_url} alt="Resolution" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                            <div className="absolute inset-x-0 bottom-0 bg-green-700/80 text-[10px] sm:text-xs text-center text-white py-1 font-medium backdrop-blur-sm">Resolution</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={`${status.color} border shrink-0 py-1 px-2.5 font-semibold text-xs rounded-full shadow-sm sm:self-start w-fit mt-2 sm:mt-0`}>
                                            <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                                            {status.label}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
