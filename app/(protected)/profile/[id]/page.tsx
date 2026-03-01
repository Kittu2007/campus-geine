import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Github, Linkedin, Code2, Award, GraduationCap, ArrowLeft, Mail, Briefcase
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
            <div className="max-w-2xl mx-auto px-4 py-16 text-center font-sans">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Profile not found</h2>
                    <p className="text-slate-500 mb-6">The user you are looking for does not exist or has been removed.</p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const initials = profile.display_name
        ? profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : profile.email[0].toUpperCase()

    const socialLinks = [
        { url: profile.github_url, icon: Github, label: 'GitHub', color: 'text-slate-700 hover:text-black hover:bg-slate-200 ring-slate-200' },
        { url: profile.linkedin_url, icon: Linkedin, label: 'LinkedIn', color: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100 ring-blue-100' },
        { url: profile.leetcode_url, icon: Code2, label: 'LeetCode', color: 'text-amber-500 hover:text-amber-600 hover:bg-amber-100 ring-amber-100' },
        { url: profile.hackerrank_url, icon: Award, label: 'HackerRank', color: 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 ring-emerald-100' },
    ].filter(l => l.url)

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
            <Link href="/dashboard" className="inline-flex flex-row items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-sm rounded-3xl">
                {/* Header gradient */}
                <div className="h-36 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 relative">
                    {profile.role === 'admin' && (
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-sm backdrop-blur-md px-3 font-semibold tracking-wide uppercase text-[10px]">Staff / Admin</Badge>
                        </div>
                    )}
                </div>

                <CardContent className="relative pt-0 px-8 pb-10 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative -mt-20 mb-5">
                        <Avatar className="w-36 h-36 border-4 border-white shadow-md ring-4 ring-blue-100 bg-white">
                            <AvatarImage src={profile.avatar_url} alt={profile.display_name || 'User'} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 text-4xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                        {profile.display_name || profile.email.split('@')[0]}
                    </h1>

                    {(profile.branch || profile.year_of_study) && (
                        <div className="flex items-center justify-center gap-2 mb-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                            <GraduationCap className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-slate-600">
                                {profile.branch && `${profile.branch}`}
                                {profile.branch && profile.year_of_study && <span className="text-slate-300 mx-1.5">|</span>}
                                {profile.year_of_study && `Year ${profile.year_of_study}`}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {/* Primary Institutional Email (Hide if it's a placeholder) */}
                        {profile.email && !profile.email.includes('example.com') && !profile.email.includes('internal') && (
                            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-600 font-medium bg-white py-1.5 px-3 rounded-lg shadow-sm border border-slate-100">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{profile.email}</span>
                            </div>
                        )}

                        {/* Professional/Personal Email */}
                        {profile.professional_email && profile.professional_email !== profile.email && (
                            <div className="flex items-center justify-center gap-2.5 text-sm text-blue-700 font-medium bg-blue-50 py-1.5 px-3 rounded-lg shadow-sm border border-blue-100">
                                <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="truncate">{profile.professional_email}</span>
                            </div>
                        )}
                    </div>

                    {profile.bio ? (
                        <div className="w-full text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About Me</h3>
                            <p className="text-slate-600 text-[15px] leading-relaxed max-w-lg mx-auto whitespace-pre-wrap font-medium">{profile.bio}</p>
                        </div>
                    ) : (
                        <div className="w-full text-center mb-2">
                            <p className="text-slate-400 text-sm italic">This student hasn&apos;t written a bio yet.</p>
                        </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                        <div className="w-full mt-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Skills</h3>
                            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                                {profile.skills.map((skill: string) => (
                                    <Badge key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 font-medium">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Links as Icon Buttons */}
                    {socialLinks.length > 0 && (
                        <div className="w-full mt-8 pt-8 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Connect</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {socialLinks.map(link => {
                                    const Icon = link.icon
                                    return (
                                        <a
                                            key={link.label}
                                            href={link.url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={link.label}
                                            className={`w-12 h-12 flex flex-col items-center justify-center rounded-full bg-slate-50 ring-1 shadow-sm transition-all duration-300 transform hover:scale-110 hover:shadow-md ${link.color}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
