'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { BookOpen, Plus, Trash2, Loader2, Link2, FileText, Video, Sparkles, ArrowRight, ShieldCheck, Database, LayoutGrid } from 'lucide-react'

interface Resource {
    id: string
    title: string
    subject: string
    type: string
    url: string
    description: string | null
    created_at: string
}

const subjects = [
    'Data Structures', 'DBMS', 'Operating Systems', 'Networks',
    'Mathematics', 'Physics', 'English', 'Others',
]

const typeConfig: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    link: { icon: Link2, color: 'text-blue-600', bg: 'bg-blue-50' },
    pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
    video: { icon: Video, color: 'text-amber-600', bg: 'bg-amber-50' },
    prompt: { icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' }
}

export default function AdminResourcesPage() {
    const { user: firebaseUser } = useAuth()
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: '', subject: '', type: 'link', url: '', description: '', promptText: ''
    })
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        fetchResources()
    }, [])

    const fetchResources = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false })
        setResources(data || [])
        setLoading(false)
    }

    const addResource = async (e: React.FormEvent) => {
        e.preventDefault()
        let finalUrl = form.url

        if (form.type === 'prompt') {
            if (!form.promptText) {
                toast.error('Requirement: Prompt Text')
                return
            }
            finalUrl = ''
        } else if (['pdf', 'video'].includes(form.type)) {
            if (!file) {
                toast.error('Requirement: File Upload')
                return
            }
        } else if (form.type === 'link' && !form.url) {
            toast.error('Requirement: Valid URL')
            return
        }

        setSaving(true)
        try {
            const supabase = createClient()

            if (['pdf', 'video'].includes(form.type) && file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('resources')
                    .upload(`${form.subject}/${fileName}`, file)

                if (uploadError) throw uploadError

                const { data: publicUrl } = supabase.storage.from('resources').getPublicUrl(`${form.subject}/${fileName}`)
                finalUrl = publicUrl.publicUrl
            }

            const { error: dbError } = await supabase
                .from('resources')
                .insert({
                    title: form.title,
                    subject: form.subject,
                    type: form.type,
                    url: finalUrl,
                    description: form.type === 'prompt' ? form.promptText : form.description,
                    creator_id: firebaseUser?.uid
                })

            if (dbError) throw dbError

            toast.success('Matrix Record Inserted')
            setForm({ title: '', subject: '', type: 'link', url: '', description: '', promptText: '' })
            setFile(null)
            fetchResources()
        } catch (error: any) {
            toast.error('Sync Error: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const deleteResource = async (id: string, url: string) => {
        if (!confirm('Execute permanent deletion of asset?')) return
        try {
            const supabase = createClient()
            if (url && url.includes('supabase.co/storage')) {
                const path = url.split('resources/').pop()
                if (path) await supabase.storage.from('resources').remove([path])
            }
            await supabase.from('resources').delete().eq('id', id)
            toast.success('Asset Erased')
            fetchResources()
        } catch {
            toast.error('Deletion Failed')
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-1 py-8 animate-slide-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-[#C62026]" />
                        Asset Governance
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter uppercase">
                        Resource <span className="text-[#C62026]">Management</span>
                    </h1>
                </div>
                <div className="bg-white border-[1.5px] border-slate-200/60 p-2 rounded-sm shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#1E2B58]/5 flex items-center justify-center">
                        <Database className="w-5 h-5 text-[#1E2B58]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Total Assets</p>
                        <p className="text-xl font-black text-[#1E2B58] leading-none tracking-tighter">{resources.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-slate-100 border border-slate-200 overflow-hidden">
                {/* Addition Matrix */}
                <div className="lg:col-span-4 bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-sm bg-[#C62026] flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1E2B58]">Initialize New Asset</h2>
                    </div>

                    <form onSubmit={addResource} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Title</Label>
                            <Input
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="E.g. Discrete Math Notes"
                                required
                                className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Matrix</Label>
                                <Select value={form.subject} onValueChange={s => setForm({ ...form, subject: s })} required>
                                    <SelectTrigger className="h-10 rounded-sm border-slate-200 font-bold uppercase tracking-widest text-[9px]">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-sm border-slate-200">
                                        {subjects.map(s => <SelectItem key={s} value={s} className="font-bold uppercase tracking-widest text-[9px] py-2">{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Type</Label>
                                <Select value={form.type} onValueChange={t => setForm({ ...form, type: t })} required>
                                    <SelectTrigger className="h-10 rounded-sm border-slate-200 font-bold uppercase tracking-widest text-[9px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-sm border-slate-200">
                                        {Object.keys(typeConfig).map(t => <SelectItem key={t} value={t} className="font-bold uppercase tracking-widest text-[9px] py-2">{t.toUpperCase()}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {form.type === 'prompt' ? (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Prompt Content</Label>
                                <Textarea
                                    value={form.promptText}
                                    onChange={e => setForm({ ...form, promptText: e.target.value })}
                                    className="min-h-[140px] rounded-sm border-slate-200 focus-visible:ring-[#1E2B58] text-xs font-medium p-4 resize-none"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2 text-center border-[1.5px] border-dashed border-slate-200 p-8 rounded-sm hover:border-[#C62026] transition-colors relative group">
                                    <Input
                                        type="file"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <LayoutGrid className="w-8 h-8 text-slate-300 mb-2 group-hover:text-[#C62026] transition-colors" />
                                        <p className="text-[10px] font-black text-[#1E2B58] uppercase tracking-widest">
                                            {file ? file.name : 'Select Structural File'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metadata Description</Label>
                                    <Input
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Optional descriptor..."
                                        className="h-10 rounded-sm border-slate-200"
                                    />
                                </div>
                            </>
                        )}

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-[#1E2B58] hover:bg-[#151f42] text-white h-14 rounded-sm shadow-xl font-black uppercase tracking-[0.2em] text-[10px] hover:animate-pulse-interlock"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit to Registry'}
                        </Button>
                    </form>
                </div>

                {/* Registry Matrix */}
                <div className="lg:col-span-8 bg-slate-50 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-sm bg-[#1E2B58] flex items-center justify-center">
                            <Database className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1E2B58]">Active Asset Registry</h2>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full bg-slate-200" />)}
                        </div>
                    ) : (
                        <div className="space-y-px bg-slate-200 border border-slate-200 overflow-hidden">
                            {resources.map(resource => {
                                const cfg = typeConfig[resource.type] || typeConfig.link
                                const Icon = cfg.icon
                                return (
                                    <div key={resource.id} className="bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all duration-300 hover:bg-slate-50 relative border-l-4 border-l-[#1E2B58]">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-sm ${cfg.bg} border border-[#1E2B58]/10 group-hover:bg-[#C62026]/5 transition-all`}>
                                                <Icon className={`w-6 h-6 ${cfg.color} group-hover:text-[#C62026] transition-colors`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{resource.subject}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[9px] font-black text-[#1E2B58] uppercase tracking-widest leading-none bg-[#1E2B58]/5 px-1.5 py-0.5 rounded-sm border border-[#1E2B58]/10">
                                                        {resource.type}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-black text-[#1E2B58] tracking-tight truncate uppercase">{resource.title}</h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <a href={resource.url} target="_blank" rel="noreferrer">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-[#1E2B58] hover:bg-slate-100">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </a>
                                            <div className="w-px h-6 bg-slate-200 mx-1" />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => deleteResource(resource.id, resource.url)}
                                                className="h-10 w-10 text-slate-300 hover:text-[#C62026] hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
