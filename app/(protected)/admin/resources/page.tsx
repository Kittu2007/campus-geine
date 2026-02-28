'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { BookOpen, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react'

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

export default function AdminResourcesPage() {
    const { user: firebaseUser } = useAuth()
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: '', subject: '', type: 'link', url: '', description: ''
    })

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
        if (!form.title || !form.subject || !form.url) {
            toast.error('Please fill all required fields')
            return
        }

        setSaving(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('resources').insert({
                title: form.title,
                subject: form.subject,
                type: form.type,
                url: form.url,
                description: form.description || null,
                uploaded_by: firebaseUser?.uid,
            })
            if (error) throw error
            toast.success('Resource added!')
            setForm({ title: '', subject: '', type: 'link', url: '', description: '' })
            fetchResources()
        } catch {
            toast.error('Failed to add resource')
        } finally {
            setSaving(false)
        }
    }

    const deleteResource = async (id: string) => {
        const supabase = createClient()
        const { error } = await supabase.from('resources').delete().eq('id', id)
        if (error) {
            toast.error('Failed to delete')
        } else {
            toast.success('Resource deleted')
            fetchResources()
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-emerald-400" />
                Manage Resources
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Form */}
                <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Add Resource
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={addResource} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Title *</Label>
                                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" placeholder="Resource title" required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Subject *</Label>
                                <Select value={form.subject} onValueChange={v => setForm({ ...form, subject: v })}>
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {subjects.map(s => (
                                            <SelectItem key={s} value={s} className="text-slate-200 focus:bg-slate-700">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Type *</Label>
                                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="link" className="text-slate-200">🔗 Link</SelectItem>
                                        <SelectItem value="video" className="text-slate-200">🎬 Video</SelectItem>
                                        <SelectItem value="pdf" className="text-slate-200">📄 PDF</SelectItem>
                                        <SelectItem value="prompt" className="text-slate-200">✨ AI Prompt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">URL *</Label>
                                <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" placeholder="https://..." required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Description</Label>
                                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" placeholder="Optional description" />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Add Resource
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing Resources */}
                <div className="lg:col-span-2 space-y-3">
                    {loading ? (
                        <p className="text-slate-500">Loading...</p>
                    ) : resources.length === 0 ? (
                        <p className="text-slate-500 text-center py-12">No resources yet</p>
                    ) : (
                        resources.map(r => (
                            <Card key={r.id} className="bg-slate-800/30 border-slate-700/50">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-white text-sm truncate">{r.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">{r.subject}</Badge>
                                            <Badge variant="outline" className="text-xs capitalize">{r.type}</Badge>
                                        </div>
                                    </div>
                                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </a>
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        onClick={() => deleteResource(r.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
