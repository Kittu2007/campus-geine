'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertTriangle, Clock, CheckCircle2, WrenchIcon } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: WrenchIcon },
    resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
}

interface Complaint {
    id: string
    category: string
    room_no: string
    description: string
    status: string
    image_url: string | null
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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                        My Complaints
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Track your infrastructure complaints</p>
                </div>
                <Link href="/complaints/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> New Complaint
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full bg-slate-800" />
                    ))}
                </div>
            ) : complaints.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-2">No complaints yet</h3>
                        <p className="text-sm text-slate-500 mb-4">You haven&apos;t submitted any infrastructure complaints.</p>
                        <Link href="/complaints/new">
                            <Button>Submit Your First Complaint</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {complaints.map(complaint => {
                        const status = statusConfig[complaint.status] || statusConfig.pending
                        const StatusIcon = status.icon
                        return (
                            <Card key={complaint.id} className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {complaint.category}
                                                </Badge>
                                                <span className="text-xs text-slate-500">Room {complaint.room_no}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 line-clamp-2">{complaint.description}</p>
                                            <p className="text-xs text-slate-500 mt-2">
                                                {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <Badge className={`${status.color} border shrink-0`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
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
