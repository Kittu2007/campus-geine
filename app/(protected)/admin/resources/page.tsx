'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { BookOpen, Plus, Trash2, Loader2, ExternalLink, Link2, FileText, Video, Sparkles } from 'lucide-react'

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
    link: { icon: Link2, color: 'text-blue-600', bg: 'bg-blue-100' },
    pdf: { icon: FileText, color: 'text-rose-600', bg: 'bg-rose-100' },
    video: { icon: Video, color: 'text-amber-600', bg: 'bg-amber-100' },
    prompt: { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' }
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
                toast.error('Please enter the prompt text')
                return
            }
            finalUrl = '' // Prompts don't use URLs, they use descriptions
        } else if (['pdf', 'video'].includes(form.type)) {
            if (!file) {
                toast.error('Please select a file to upload')
                return
            }
        } else if (form.type === 'link' && !form.url) {
            toast.error('Please provide a valid URL')
            return
        }

        setSaving(true)
        try {
            const supabase = createClient()

            // 1. Upload file if required
            if (['pdf', 'video'].includes(form.type) && file) {
                toast.loading('Uploading file...')
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                const { error: uploadError, data } = await supabase.storage
                    .from('resources')
                    .upload(`${form.subject}/${fileName}`, file)

                if (uploadError) throw uploadError

                const { data: publicUrl } = supabase.storage.from('resources').getPublicUrl(`${form.subject}/${fileName}`)
                finalUrl = publicUrl.publicUrl
                toast.dismiss()
            }
            const { error } = await supabase.from('resources').insert({
                title: form.title,
                subject: form.subject,
                type: form.type,
                url: finalUrl,
                description: form.type === 'prompt' ? form.promptText : (form.description || null),
                uploaded_by: firebaseUser?.uid,
            })
            if (error) throw error
            toast.success('Resource added successfully!')
            setForm({ title: '', subject: '', type: 'link', url: '', description: '', promptText: '' })
            setFile(null)
            fetchResources()
        } catch (error) {
            console.error('Resource upload error:', error)
            toast.error('Failed to add resource')
        } finally {
            setSaving(false)
        }
    }

    const deleteResource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return
        const supabase = createClient()
        const { error } = await supabase.from('resources').delete().eq('id', id)
        if (error) {
            toast.error('Failed to delete resource')
        } else {
            toast.success('Resource deleted')
            fetchResources()
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Resources</h1>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">Upload and organize academic materials for students</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <Card className="bg-white border-slate-200 shadow-sm sticky top-8 rounded-2xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-600" /> Add New Resource
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium">
                                Fill in the details to upload a new resource.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={addResource} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold">Title *</Label>
                                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-emerald-600 shadow-sm" placeholder="e.g. Midterm Study Guide" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold">Subject *</Label>
                                    <Select value={form.subject} onValueChange={v => setForm({ ...form, subject: v })} required>
                                        <SelectTrigger className="bg-slate-50/50 border-slate-200 text-slate-800 focus:ring-emerald-600 shadow-sm">
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 shadow-md rounded-xl">
                                            {subjects.map(s => (
                                                <SelectItem key={s} value={s} className="text-slate-700 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer font-medium">{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold">Format Type *</Label>
                                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                        <SelectTrigger className="bg-slate-50/50 border-slate-200 text-slate-800 focus:ring-emerald-600 shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 shadow-md rounded-xl">
                                            <SelectItem value="link" className="focus:bg-emerald-50 text-slate-700 font-medium">🔗 Web Link</SelectItem>
                                            <SelectItem value="video" className="focus:bg-emerald-50 text-slate-700 font-medium">🎬 Video Course</SelectItem>
                                            <SelectItem value="pdf" className="focus:bg-emerald-50 text-slate-700 font-medium">📄 PDF Document</SelectItem>
                                            <SelectItem value="prompt" className="focus:bg-emerald-50 text-slate-700 font-medium">✨ AI Prompt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {['pdf', 'video'].includes(form.type) ? (
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Upload File *</Label>
                                        <Input
                                            type="file"
                                            accept={form.type === 'pdf' ? '.pdf' : 'video/*'}
                                            onChange={e => setFile(e.target.files?.[0] || null)}
                                            className="bg-slate-50/50 border-slate-200 text-slate-600 file:bg-emerald-100 file:text-emerald-700 file:font-semibold file:border-0 file:rounded-md file:px-3 file:py-1 hover:file:bg-emerald-200 shadow-sm cursor-pointer file:cursor-pointer transition-colors"
                                            required
                                        />
                                    </div>
                                ) : form.type === 'prompt' ? (
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Prompt Content *</Label>
                                        <Textarea
                                            value={form.promptText}
                                            onChange={e => setForm({ ...form, promptText: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 text-slate-800 focus-visible:ring-emerald-600 shadow-sm min-h-[100px] resize-none"
                                            placeholder="Paste the prompt or tricky question here..."
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Resource URL *</Label>
                                        <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-emerald-600 shadow-sm" placeholder="https://..." required />
                                    </div>
                                )}

                                {form.type !== 'prompt' && (
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Short Note</Label>
                                        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-emerald-600 shadow-sm resize-none" placeholder="Optional description..." />
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" disabled={saving}>
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                                        Publish Resource
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Existing Resources */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <h2 className="text-lg font-bold text-slate-800">Uploaded Resources</h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{resources.length} Total</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : resources.length === 0 ? (
                        <Card className="bg-slate-50 border-slate-200 border-dashed border-2 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="bg-slate-100 p-4 rounded-full mb-4">
                                    <BookOpen className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">No resources found</h3>
                                <p className="text-sm text-slate-500 font-medium">Be the first to upload study materials for your peers!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {resources.map(r => {
                                const typeStyling = typeConfig[r.type] || typeConfig['link']
                                const Icon = typeStyling.icon

                                return (
                                    <Card key={r.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 rounded-xl overflow-hidden group">
                                        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">

                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeStyling.bg} group-hover:scale-105 transition-transform duration-300`}>
                                                <Icon className={`w-6 h-6 ${typeStyling.color}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 text-base truncate mb-1 group-hover:text-emerald-700 transition-colors">{r.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0 border-transparent hover:bg-slate-200">{r.subject}</Badge>
                                                    <Badge variant="outline" className={`text-[10px] capitalize px-2 py-0 border-${typeStyling.color.split('-')[1]}-200 ${typeStyling.color} bg-${typeStyling.color.split('-')[1]}-50`}>
                                                        {r.type}
                                                    </Badge>
                                                    <span className="text-xs font-medium text-slate-400 ml-1">
                                                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 justify-end">
                                                {r.type !== 'prompt' && r.url && (
                                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                                                        <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 font-semibold h-9">
                                                            <ExternalLink className="w-4 h-4 mr-2 sm:mr-0" />
                                                            <span className="sm:hidden">Open</span>
                                                        </Button>
                                                    </a>
                                                )}
                                                <Button variant="outline" size="sm" className="bg-white border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-9"
                                                    onClick={() => deleteResource(r.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
