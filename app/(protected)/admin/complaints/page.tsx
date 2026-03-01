'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    AlertTriangle, Clock, CheckCircle2, WrenchIcon, Filter, Loader2, Image as ImageIcon, Trash2, ArrowRight, ShieldCheck, Database
} from 'lucide-react'

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
    profiles: { display_name: string | null; email: string } | null
}

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [resolveModalOpen, setResolveModalOpen] = useState(false)
    const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null)
    const [resolutionFile, setResolutionFile] = useState<File | null>(null)
    const [isResolving, setIsResolving] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const f = params.get('filter')
            if (f && ['all', 'pending', 'in_progress', 'resolved'].includes(f)) {
                setFilter(f)
            }
        }
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('complaints')
            .select('*, profiles:user_id(display_name, email)')
            .order('created_at', { ascending: false })

        setComplaints(data || [])
        setLoading(false)
    }

    const updateComplaint = async (id: string, updates: { status?: string; admin_notes?: string }) => {
        setUpdatingId(id)
        const supabase = createClient()
        const { error } = await supabase
            .from('complaints')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            toast.error('Sync Error')
        } else {
            toast.success('Central Registry Updated')
            fetchComplaints()
        }
        setUpdatingId(null)
    }

    const deleteComplaint = async (id: string) => {
        if (!confirm('Execute permanent deletion of record?')) return
        const supabase = createClient()
        const { error } = await supabase.from('complaints').delete().eq('id', id)
        if (error) {
            toast.error('Deletion Failed')
        } else {
            toast.success('Record Erased')
            fetchComplaints()
        }
    }

    const filtered = complaints.filter(c => filter === 'all' || c.status === filter)

    return (
        <div className="max-w-7xl mx-auto px-1 py-8 animate-slide-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-[#C62026]" />
                        Governance Core
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter uppercase">
                        Administrative <span className="text-[#C62026]">Control</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-sm">
                    {['all', 'pending', 'in_progress', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${filter === f
                                    ? 'bg-white text-[#1E2B58] shadow-sm'
                                    : 'text-slate-500 hover:text-[#1E2B58]'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Matrix */}
            <div className="px-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-40 w-full bg-slate-100 rounded-sm" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center border-[1.5px] border-dashed border-slate-200 bg-slate-50/50 rounded-sm">
                        <div className="w-16 h-16 rounded-sm bg-white border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-[#1E2B58] tracking-tighter uppercase mb-2 italic">Queue Clear</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active anomalies in the current filter matrix</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-1 bg-slate-100 p-px border border-slate-200 overflow-hidden">
                        {filtered.map(complaint => {
                            const status = statusConfig[complaint.status] || statusConfig.pending
                            const StatusIcon = status.icon
                            return (
                                <Card key={complaint.id} className="bg-white border-none rounded-none shadow-none group relative overflow-hidden transition-all duration-300 hover:z-10 shadow-sm border-l-[6px] border-l-[#1E2B58]">
                                    <CardContent className="p-8">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            {/* Report Details */}
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-sm ${status.color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                            LOG: #{complaint.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteComplaint(complaint.id)}
                                                        className="text-slate-300 hover:text-[#C62026] hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-black text-[#1E2B58] tracking-tight uppercase mb-2">
                                                        Room {complaint.room_no} • {complaint.category.replace('_', ' ')}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-3xl border-l-[3px] border-slate-100 pl-4 py-1">
                                                        {complaint.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-sm bg-slate-100 flex items-center justify-center">
                                                            <User className="w-3 h-3 text-slate-500" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {complaint.profiles?.display_name || complaint.profiles?.email.split('@')[0]}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                            {new Date(complaint.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Admin Controls */}
                                            <div className="w-full lg:w-80 bg-slate-50 p-6 rounded-sm border border-slate-200/60 space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Status</label>
                                                    <Select
                                                        defaultValue={complaint.status}
                                                        onValueChange={(val) => updateComplaint(complaint.id, { status: val })}
                                                        disabled={updatingId === complaint.id}
                                                    >
                                                        <SelectTrigger className="h-10 bg-white rounded-sm border-slate-200 font-bold uppercase tracking-widest text-[10px] focus:ring-[#1E2B58]">
                                                            {updatingId === complaint.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <SelectValue />}
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                                                            <SelectItem value="pending" className="font-bold uppercase tracking-widest text-[10px] py-3">Pending</SelectItem>
                                                            <SelectItem value="in_progress" className="font-bold uppercase tracking-widest text-[10px] py-3">In Progress</SelectItem>
                                                            <SelectItem value="resolved" className="font-bold uppercase tracking-widest text-[10px] py-3">Resolved</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Intelligence Notes</label>
                                                    <Textarea
                                                        placeholder="Enter resolution notes..."
                                                        defaultValue={complaint.admin_notes || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== (complaint.admin_notes || '')) {
                                                                updateComplaint(complaint.id, { admin_notes: e.target.value })
                                                            }
                                                        }}
                                                        className="min-h-[100px] bg-white rounded-sm border-slate-200 text-xs font-medium resize-none p-3"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="mt-12 px-4">
                <div className="bg-[#1E2B58] text-white p-6 rounded-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-[#C62026] flex items-center justify-center shadow-lg">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Synchronization Core</p>
                            <p className="text-[10px] font-medium text-blue-200 mt-1 uppercase tracking-widest">Real-time governance matrix operational</p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest text-right italic">Genie Administrative Unit • Secure Layer</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 
