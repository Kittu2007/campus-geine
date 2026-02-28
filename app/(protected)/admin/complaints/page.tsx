'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    AlertTriangle, Clock, CheckCircle2, WrenchIcon, Filter, Loader2, Image as ImageIcon
} from 'lucide-react'

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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    Complaints Dashboard
                </h1>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all" className="text-slate-200">All</SelectItem>
                            <SelectItem value="pending" className="text-slate-200">Pending</SelectItem>
                            <SelectItem value="in_progress" className="text-slate-200">In Progress</SelectItem>
                            <SelectItem value="resolved" className="text-slate-200">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {['pending', 'in_progress', 'resolved'].map(s => {
                    const config = statusConfig[s]
                    const count = complaints.filter(c => c.status === s).length
                    const Icon = config.icon
                    return (
                        <Card key={s} className="bg-slate-800/50 border-slate-700/50">
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-2xl font-bold text-white">{count}</p>
                                    <p className="text-xs text-slate-400">{config.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 bg-slate-800" />)}
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(complaint => {
                        const status = statusConfig[complaint.status]
                        return (
                            <Card key={complaint.id} className="bg-slate-800/50 border-slate-700/50">
                                <CardContent className="p-5">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        {/* Image */}
                                        <div className="w-full lg:w-32 flex flex-col gap-2 shrink-0">
                                            {complaint.image_url && (
                                                <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-700 relative group">
                                                    <img src={complaint.image_url} alt="Issue" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white transition-opacity font-medium">Issue</div>
                                                </div>
                                            )}
                                            {complaint.resolution_image_url && (
                                                <div className="w-full h-24 rounded-lg overflow-hidden bg-emerald-900/40 relative group border border-emerald-500/20">
                                                    <img src={complaint.resolution_image_url} alt="Resolution" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-emerald-500/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white transition-opacity font-medium">Resolution</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="capitalize text-xs">{complaint.category}</Badge>
                                                <span className="text-xs text-slate-500">Room {complaint.room_no}</span>
                                                <span className="text-xs text-slate-500">·</span>
                                                <span className="text-xs text-slate-500">
                                                    {complaint.profiles?.display_name || complaint.profiles?.email?.split('@')[0]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-300 mb-2">{complaint.description}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(complaint.created_at).toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 shrink-0 w-full lg:w-48">
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
                                                <SelectTrigger className={`${status.color} border text-xs h-8`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    <SelectItem value="pending" className="text-slate-200">⏳ Pending</SelectItem>
                                                    <SelectItem value="in_progress" className="text-slate-200">🔧 In Progress</SelectItem>
                                                    <SelectItem value="resolved" className="text-slate-200">✅ Resolved</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Textarea
                                                placeholder="Admin notes..."
                                                defaultValue={complaint.admin_notes || ''}
                                                className="text-xs bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[60px]"
                                                onBlur={(e) => {
                                                    if (e.target.value !== (complaint.admin_notes || '')) {
                                                        updateComplaint(complaint.id, { admin_notes: e.target.value })
                                                    }
                                                }}
                                            />
                                            {updatingId === complaint.id && (
                                                <div className="flex items-center gap-1 text-xs text-blue-400">
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                            Resolve Complaint
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-400 leading-relaxed">
                            To mark this complaint as resolved, please upload a photo proving that the issue has been fixed. This will be visible to the student.
                        </p>
                        <div className="p-4 border border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center gap-3">
                            <ImageIcon className="w-8 h-8 text-slate-500" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 font-medium"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => {
                            setResolveModalOpen(false)
                            setResolutionFile(null)
                            setResolvingComplaintId(null)
                        }} disabled={isResolving}>
                            Cancel
                        </Button>
                        <Button onClick={handleResolveSubmit} disabled={!resolutionFile || isResolving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isResolving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Submit Resolution
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
