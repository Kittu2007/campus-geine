'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Github, Linkedin, Code2, Award, User, Briefcase, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react'
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
            toast.success('Profile updated successfully!')
            router.push(`/profile/${firebaseUser.uid}`)
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-slate-500 font-medium">Loading your profile...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
            <Link href={`/profile/${firebaseUser?.uid}`} className="inline-flex flex-row items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>

            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <div className="h-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
                <CardHeader className="pb-4 pt-8 px-8">
                    <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">Edit Profile</CardTitle>
                    <CardDescription className="text-slate-500 text-base">
                        Update your information, academic details, and social links.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info Section */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
                                <User className="w-4 h-4" /> Personal Details
                            </h3>

                            <div className="space-y-3">
                                <Label className="text-slate-700 font-semibold">Display Name</Label>
                                <Input
                                    value={form.display_name}
                                    onChange={e => setForm({ ...form, display_name: e.target.value })}
                                    placeholder="Your full name"
                                    className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 shadow-sm h-11"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-700 font-semibold flex items-center justify-between">
                                    Professional Email
                                    <span className="text-xs font-normal text-slate-400">Optional</span>
                                </Label>
                                <Input
                                    value={form.professional_email}
                                    onChange={e => setForm({ ...form, professional_email: e.target.value })}
                                    placeholder="name@company.com"
                                    type="email"
                                    className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 shadow-sm h-11"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-700 font-semibold flex items-center justify-between">
                                    Bio
                                    <span className={`text-xs ${form.bio.length > 180 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
                                        {form.bio.length}/200
                                    </span>
                                </Label>
                                <Textarea
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                                    placeholder="A short bio about yourself..."
                                    className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 shadow-sm min-h-[100px] resize-none pb-2 leading-relaxed"
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        {/* Academic Section */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
                                <GraduationCap className="w-4 h-4" /> Academic Info
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <Label className="text-slate-700 font-semibold">Year of Study</Label>
                                    <Select value={form.year_of_study} onValueChange={v => setForm({ ...form, year_of_study: v })}>
                                        <SelectTrigger className="bg-slate-50/50 border-slate-200 text-slate-800 focus:ring-blue-600 shadow-sm h-11">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 shadow-md rounded-xl">
                                            {['1', '2', '3', '4'].map(y => (
                                                <SelectItem key={y} value={y} className="text-slate-700 focus:bg-slate-50 focus:text-blue-700 cursor-pointer font-medium">Year {y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-slate-700 font-semibold">Branch</Label>
                                    <Input
                                        value={form.branch}
                                        onChange={e => setForm({ ...form, branch: e.target.value })}
                                        placeholder="e.g., CSE, ECE, IT"
                                        className="bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 shadow-sm h-11 uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Profiles Section */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
                                <Briefcase className="w-4 h-4" /> Social Profiles
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'github_url', icon: Github, label: 'GitHub', placeholder: 'https://github.com/username', color: 'text-slate-700' },
                                    { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', color: 'text-blue-600' },
                                    { key: 'leetcode_url', icon: Code2, label: 'LeetCode', placeholder: 'https://leetcode.com/username', color: 'text-amber-500' },
                                    { key: 'hackerrank_url', icon: Award, label: 'HackerRank', placeholder: 'https://hackerrank.com/profile/username', color: 'text-emerald-500' },
                                ].map(social => {
                                    const Icon = social.icon
                                    return (
                                        <div key={social.key} className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors">
                                                <Icon className={`w-5 h-5 ${social.color} opacity-70 group-focus-within:opacity-100 transition-opacity`} />
                                            </div>
                                            <Input
                                                value={form[social.key as keyof typeof form]}
                                                onChange={e => setForm({ ...form, [social.key]: e.target.value })}
                                                placeholder={social.placeholder}
                                                className="pl-11 bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600 shadow-sm h-11 transition-all"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5"
                                disabled={saving}
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</span>
                                ) : (
                                    <span className="flex items-center gap-2 text-base"><Save className="w-5 h-5" /> Save Profile</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
