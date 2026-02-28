'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Github, Linkedin, Code2, Award } from 'lucide-react'

export default function EditProfilePage() {
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
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
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
            })
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

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
                })
                .eq('id', user.id)

            if (error) throw error
            toast.success('Profile updated!')
            router.push(`/profile/${user.id}`)
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Display Name</Label>
                            <Input
                                value={form.display_name}
                                onChange={e => setForm({ ...form, display_name: e.target.value })}
                                placeholder="Your full name"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Bio ({form.bio.length}/200)</Label>
                            <Textarea
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                                placeholder="A short bio about yourself..."
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                maxLength={200}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Year of Study</Label>
                                <Select value={form.year_of_study} onValueChange={v => setForm({ ...form, year_of_study: v })}>
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {['1', '2', '3', '4'].map(y => (
                                            <SelectItem key={y} value={y} className="text-slate-200 focus:bg-slate-700">Year {y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Branch</Label>
                                <Input
                                    value={form.branch}
                                    onChange={e => setForm({ ...form, branch: e.target.value })}
                                    placeholder="e.g., CSE, ECE, IT"
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-700/50 pt-5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">Social Profiles</h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'github_url', icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
                                    { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                                    { key: 'leetcode_url', icon: Code2, label: 'LeetCode', placeholder: 'https://leetcode.com/username' },
                                    { key: 'hackerrank_url', icon: Award, label: 'HackerRank', placeholder: 'https://hackerrank.com/profile/username' },
                                ].map(social => {
                                    const Icon = social.icon
                                    return (
                                        <div key={social.key} className="flex items-center gap-3">
                                            <Icon className="w-5 h-5 text-slate-500 shrink-0" />
                                            <Input
                                                value={form[social.key as keyof typeof form]}
                                                onChange={e => setForm({ ...form, [social.key]: e.target.value })}
                                                placeholder={social.placeholder}
                                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            disabled={saving}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Profile</span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
