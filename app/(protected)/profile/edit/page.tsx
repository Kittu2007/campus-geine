'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Github, Linkedin, Code2, Award, User, Briefcase, BookOpen, GraduationCap, ArrowLeft, Fingerprint, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function EditProfilePage() {
    const { user: firebaseUser } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        display_name: '',
        bio: '',
        year_of_study: '',
        branch: '',
        github_url: '',
        linkedin_url: '',
        leetcode_url: '',
        hackerrank_url: '',
        professional_email: '',
    })

    useEffect(() => {
        if (firebaseUser) loadProfile()
    }, [firebaseUser])

    const loadProfile = async () => {
        if (!firebaseUser) return
        const supabase = createClient()

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', firebaseUser.uid)
            .single()

        if (data) {
            setForm({
                display_name: data.display_name || '',
                bio: data.bio || '',
                year_of_study: data.year_of_study?.toString() || '',
                branch: data.branch || '',
                github_url: data.github_url || '',
                linkedin_url: data.linkedin_url || '',
                leetcode_url: data.leetcode_url || '',
                hackerrank_url: data.hackerrank_url || '',
                professional_email: data.professional_email || '',
            })
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const supabase = createClient()
            if (!firebaseUser) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: form.display_name || null,
                    bio: form.bio || null,
                    year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null,
                    branch: form.branch || null,
                    github_url: form.github_url || null,
                    linkedin_url: form.linkedin_url || null,
                    leetcode_url: form.leetcode_url || null,
                    hackerrank_url: form.hackerrank_url || null,
                    professional_email: form.professional_email || null,
                })
                .eq('id', firebaseUser.uid)

            if (error) throw error
            toast.success('Core Identity Updated')
            router.push(`/profile/${firebaseUser.uid}`)
        } catch {
            toast.error('Identity Update Failed')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-[#1E2B58]" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Identity Core...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-1 py-10 animate-slide-in">
            {/* Header Section */}
            <div className="mb-12 px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-[#C62026]" />
                        Identity Management
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter uppercase">
                        Profile <span className="text-[#C62026]">Directives</span>
                    </h1>
                </div>
                <Link href={`/profile/${firebaseUser?.uid}`}>
                    <Button variant="outline" className="h-12 px-6 rounded-sm border-slate-200 text-[#1E2B58] hover:border-[#C62026] hover:text-[#C62026] uppercase font-black tracking-widest text-xs flex items-center gap-2 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Cancel Sync
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="px-4 space-y-8 pb-20">
                {/* Basic Intel */}
                <Card className="rounded-sm border-[1.5px] border-slate-200 overflow-hidden shadow-none">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                        <User className="w-4 h-4 text-[#1E2B58]" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E2B58]">Core Personnel Data</h2>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Name</Label>
                                <Input
                                    value={form.display_name}
                                    onChange={e => setForm({ ...form, display_name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58] transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Year</Label>
                                <Select
                                    value={form.year_of_study}
                                    onValueChange={val => setForm({ ...form, year_of_study: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-sm border-slate-200 focus:ring-[#1E2B58] uppercase font-bold text-[11px] tracking-widest">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                                        {[1, 2, 3, 4].map(y => (
                                            <SelectItem key={y} value={y.toString()} className="font-bold uppercase tracking-widest text-[10px] py-3">
                                                Year {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Branch</Label>
                            <Input
                                value={form.branch}
                                onChange={e => setForm({ ...form, branch: e.target.value })}
                                placeholder="E.g., CSE - Data Science"
                                className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58] font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Personal Narrative (Bio)</Label>
                            <Textarea
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                placeholder="Describe your specialization and core objectives..."
                                className="min-h-[120px] rounded-sm border-slate-200 focus-visible:ring-[#1E2B58] font-medium resize-none p-4"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* External Connectivity */}
                <Card className="rounded-sm border-[1.5px] border-slate-200 overflow-hidden shadow-none">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                        <Fingerprint className="w-4 h-4 text-[#C62026]" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62026]">Digital Authentication Links</h2>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Github className="w-3 h-3 transition-colors group-focus-within:text-[#1E2B58]" /> GitHub Vector
                                </Label>
                                <Input
                                    value={form.github_url}
                                    onChange={e => setForm({ ...form, github_url: e.target.value })}
                                    placeholder="https://github.com/..."
                                    className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58]"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Linkedin className="w-3 h-3 transition-colors group-focus-within:text-[#1E2B58]" /> LinkedIn Node
                                </Label>
                                <Input
                                    value={form.linkedin_url}
                                    onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                    className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Code2 className="w-3 h-3 transition-colors group-focus-within:text-[#1E2B58]" /> LeetCode Identifier
                                </Label>
                                <Input
                                    value={form.leetcode_url}
                                    onChange={e => setForm({ ...form, leetcode_url: e.target.value })}
                                    placeholder="https://leetcode.com/u/..."
                                    className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58]"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Award className="w-3 h-3 transition-colors group-focus-within:text-[#1E2B58]" /> HackerRank Signature
                                </Label>
                                <Input
                                    value={form.hackerrank_url}
                                    onChange={e => setForm({ ...form, hackerrank_url: e.target.value })}
                                    placeholder="https://hackerrank.com/..."
                                    className="h-12 rounded-sm border-slate-200 focus-visible:ring-[#1E2B58]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submission Flow */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-[#C62026] hover:bg-[#a51a1f] text-white px-12 h-16 rounded-sm shadow-2xl hover:animate-pulse-interlock uppercase font-black tracking-[0.2em] text-xs flex items-center gap-3 transition-all"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Committing...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> Synchronize Identity
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Background Geometric Detail */}
            <div className="fixed bottom-0 right-0 w-64 h-64 bg-[#1E2B58]/[0.02] -mr-32 -mb-32 rotate-45 pointer-events-none" />
        </div>
    )
} 
