import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    User, Github, Linkedin, Code2, Award, GraduationCap, ArrowLeft, Mail
} from 'lucide-react'
import Link from 'next/link'

export default async function ProfileViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!profile) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <p className="text-slate-400">Profile not found</p>
            </div>
        )
    }

    const initials = profile.display_name
        ? profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : profile.email[0].toUpperCase()

    const socialLinks = [
        { url: profile.github_url, icon: Github, label: 'GitHub', color: 'hover:text-white' },
        { url: profile.linkedin_url, icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-400' },
        { url: profile.leetcode_url, icon: Code2, label: 'LeetCode', color: 'hover:text-amber-400' },
        { url: profile.hackerrank_url, icon: Award, label: 'HackerRank', color: 'hover:text-emerald-400' },
    ].filter(l => l.url)

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
                {/* Header gradient */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                <CardContent className="relative pt-0 px-6 pb-6">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-4">
                        <Avatar className="w-28 h-28 border-4 border-slate-800 shadow-xl">
                            <AvatarImage src={profile.avatar_url} alt={profile.display_name || 'User'} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <h1 className="text-2xl font-bold text-white">
                        {profile.display_name || profile.email.split('@')[0]}
                    </h1>
                    <div className="space-y-1 mb-4">
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {profile.email} (Student)
                        </p>
                        {profile.professional_email && (
                            <p className="text-blue-400 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {profile.professional_email} (Professional)
                            </p>
                        )}
                    </div>

                    {(profile.branch || profile.year_of_study) && (
                        <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-400">
                                {profile.branch && `${profile.branch}`}
                                {profile.branch && profile.year_of_study && ' · '}
                                {profile.year_of_study && `Year ${profile.year_of_study}`}
                            </span>
                        </div>
                    )}

                    {profile.bio && (
                        <p className="text-slate-300 text-sm mb-4 whitespace-pre-wrap">{profile.bio}</p>
                    )}

                    {profile.role === 'admin' && (
                        <Badge className="mb-4 bg-amber-500/15 text-amber-400 border-amber-500/20">Admin</Badge>
                    )}

                    {/* Social Links */}
                    {socialLinks.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-700/50">
                            {socialLinks.map(link => {
                                const Icon = link.icon
                                return (
                                    <a
                                        key={link.label}
                                        href={link.url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 text-sm font-medium transition-all ${link.color} hover:bg-slate-700`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </a>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
