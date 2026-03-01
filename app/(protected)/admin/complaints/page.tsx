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
    AlertTriangle, Clock, CheckCircle2, WrenchIcon, Filter, Loader2, Image as ImageIcon, Trash2
} from 'lucide-react'

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
        // Read initial filter from URL if present
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
            toast.error('Failed to update')
        } else {
            toast.success('Complaint updated')
            fetchComplaints()
        }
        setUpdatingId(null)
    }

    const deleteComplaint = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this complaint? This cannot be undone.')) return
        const supabase = createClient()
        const { error } = await supabase.from('complaints').delete().eq('id', id)
        if (error) {
            toast.error('Failed to delete complaint')
        } else {
            toast.success('Complaint deleted')
            fetchComplaints()
        }
    }

    const handleResolveSubmit = async () => {
        if (!resolvingComplaintId || !resolutionFile) return
        setIsResolving(true)
        try {
            const supabase = createClient()

            const ext = resolutionFile.name.split('.').pop()
            const fileName = `resolutions/${Date.now()}.${ext}`
            const { error: uploadError } = await supabase.storage.from('complaint-images').upload(fileName, resolutionFile)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage.from('complaint-images').getPublicUrl(fileName)
            const imageUrl = urlData.publicUrl

            const { error: updateError } = await supabase
                .from('complaints')
                .update({ status: 'resolved', resolution_image_url: imageUrl, updated_at: new Date().toISOString() })
                .eq('id', resolvingComplaintId)

            if (updateError) throw updateError

            toast.success('Complaint resolved successfully')
            fetchComplaints()
            setResolveModalOpen(false)
            setResolvingComplaintId(null)
            setResolutionFile(null)
        } catch (error: any) {
            toast.error('Failed to resolve: ' + error.message)
        } finally {
            setIsResolving(false)
        }
    }

    const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter)

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        Complaints Admin
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">Manage and resolve student infrastructure issues</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-36 border-none bg-transparent shadow-none focus:ring-0 text-slate-700 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg">
                            <SelectItem value="all" className="focus:bg-slate-50">All Complaints</SelectItem>
                            <SelectItem value="pending" className="focus:bg-amber-50 focus:text-amber-700">Pending</SelectItem>
                            <SelectItem value="in_progress" className="focus:bg-blue-50 focus:text-blue-700">In Progress</SelectItem>
                            <SelectItem value="resolved" className="focus:bg-green-50 focus:text-green-700">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {['pending', 'in_progress', 'resolved'].map(s => {
                    const config = statusConfig[s]
                    const count = complaints.filter(c => c.status === s).length
                    const Icon = config.icon
                    return (
                        <Card key={s} className="bg-white border-slate-200 shadow-sm">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.color.split(' ')[0]}`}>
                                    <Icon className={`w-6 h-6 ${config.color.split(' ')[1]}`} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-800 tracking-tight">{count}</p>
                                    <p className="text-sm font-medium text-slate-500">{config.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 bg-slate-100 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200 border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <CheckCircle2 className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">All clear!</h3>
                        <p className="text-sm text-slate-500 max-w-sm">There are no complaints matching this filter.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-5">
                    {filtered.map(complaint => {
                        const status = statusConfig[complaint.status]
                        return (
                            <Card key={complaint.id} className={`bg-white border-y border-r border-slate-200 border-l-4 ${status.border} shadow-sm transition-all duration-200 hover:shadow-md rounded-xl overflow-hidden`}>
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Image */}
                                        <div className="w-full lg:w-40 flex flex-row lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                                            {complaint.image_url && (
                                                <div className="w-24 h-24 lg:w-full lg:h-28 rounded-xl overflow-hidden bg-slate-100 relative group border border-slate-200 shrink-0">
                                                    <img src={complaint.image_url} alt="Issue" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 text-[10px] text-center text-white py-1 font-medium backdrop-blur-sm">Issue Image</div>
                                                </div>
                                            )}
                                            {complaint.resolution_image_url && (
                                                <div className="w-24 h-24 lg:w-full lg:h-28 rounded-xl overflow-hidden bg-green-50 border border-green-200 relative group shrink-0">
                                                    <img src={complaint.resolution_image_url} alt="Resolution" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-green-800/80 text-[10px] text-center text-white py-1 font-medium backdrop-blur-sm">Fix Proof</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <Badge variant="outline" className="capitalize text-xs text-slate-600 bg-slate-50 border-slate-300 font-medium">
                                                    {complaint.category.replace('_', ' ')}
                                                </Badge>
                                                <Badge className={`${status.color} border shrink-0 text-xs px-2 py-0.5`}>
                                                    <status.icon className="w-3.5 h-3.5 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                                                <span className="text-xs font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-200">Room {complaint.room_no}</span>
                                                <span className="text-slate-300 text-xs">|</span>
                                                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">
                                                        {(complaint.profiles?.display_name || complaint.profiles?.email || 'S')[0].toUpperCase()}
                                                    </div>
                                                    {complaint.profiles?.display_name || complaint.profiles?.email?.split('@')[0]}
                                                </span>
                                            </div>
                                            <p className="text-[15px] text-slate-800 mb-4 leading-relaxed font-medium">{complaint.description}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-auto">
                                                Reported: {new Date(complaint.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 shrink-0 w-full lg:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Update Status</label>
                                                <Select
                                                    value={complaint.status}
                                                    onValueChange={(v) => {
                                                        if (v === 'resolved' && !complaint.resolution_image_url) {
                                                            setResolvingComplaintId(complaint.id)
                                                            setResolveModalOpen(true)
                                                        } else {
                                                            updateComplaint(complaint.id, { status: v })
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white border-slate-200 text-sm h-10 shadow-sm focus:ring-blue-600 font-medium text-slate-700">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg">
                                                        <SelectItem value="pending" className="focus:bg-amber-50">⏳ Pending</SelectItem>
                                                        <SelectItem value="in_progress" className="focus:bg-blue-50">🔧 In Progress</SelectItem>
                                                        <SelectItem value="resolved" className="focus:bg-green-50">✅ Resolved</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex-1 relative">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Admin Notes</label>
                                                <Textarea
                                                    placeholder="Add resolution notes..."
                                                    defaultValue={complaint.admin_notes || ''}
                                                    className="text-sm bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 min-h-[80px] focus-visible:ring-blue-600 shadow-sm resize-none"
                                                    onBlur={(e) => {
                                                        if (e.target.value !== (complaint.admin_notes || '')) {
                                                            updateComplaint(complaint.id, { admin_notes: e.target.value })
                                                        }
                                                    }}
                                                />
                                                {updatingId === complaint.id && (
                                                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shadow-sm">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => deleteComplaint(complaint.id)}
                                                className="w-full bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs h-9 shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                Delete Complaint
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-800 sm:max-w-md rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600 font-bold text-xl">
                            <CheckCircle2 className="w-6 h-6" />
                            Resolve Complaint
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 mt-2">
                            To mark this complaint as resolved, please upload a photo proving that the issue has been fixed. This will be visible to the student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors file:cursor-pointer cursor-pointer"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-2 text-right sm:justify-end">
                        <Button variant="ghost" className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold" onClick={() => {
                            setResolveModalOpen(false)
                            setResolutionFile(null)
                            setResolvingComplaintId(null)
                        }} disabled={isResolving}>
                            Cancel
                        </Button>
                        <Button onClick={handleResolveSubmit} disabled={!resolutionFile || isResolving} className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm">
                            {isResolving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Submit Resolution
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
