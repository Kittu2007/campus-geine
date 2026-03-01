import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Github, Linkedin, Code2, Award, GraduationCap, ArrowLeft, Mail, Briefcase, Fingerprint, Sparkles, Binary
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
            <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-slide-in">
                <div className="bg-white border-[1.5px] border-slate-200 rounded-sm p-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16" />
                    <h2 className="text-2xl font-black text-[#1E2B58] tracking-tighter uppercase mb-2">Subject Unavailable</h2>
                    <p className="text-slate-500 font-medium mb-8 uppercase tracking-widest text-[10px]">The requested identity token does not exist in the Genie core</p>
                    <Link href="/dashboard">
                        <Button className="bg-[#1E2B58] hover:bg-[#151f42] text-white px-8 h-12 rounded-sm uppercase font-black tracking-widest text-xs">
                            Return to Core
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const initials = profile.display_name
        ? profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : profile.email[0].toUpperCase()

    const socialLinks = [
        { url: profile.github_url, icon: Github, label: 'GitHub', color: 'text-slate-700 hover:text-black' },
        { url: profile.linkedin_url, icon: Linkedin, label: 'LinkedIn', color: 'text-blue-600 hover:text-blue-800' },
        { url: profile.leetcode_url, icon: Code2, label: 'LeetCode', color: 'text-amber-500 hover:text-amber-600' },
        { url: profile.hackerrank_url, icon: Award, label: 'HackerRank', color: 'text-emerald-500 hover:text-emerald-700' },
    ].filter(l => l.url)

    return (
        <div className="max-w-4xl mx-auto px-1 py-10 animate-slide-in">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#C62026] mb-10 transition-all px-4 py-2 border border-slate-200 bg-white rounded-sm">
                <ArrowLeft className="w-3.5 h-3.5" /> Synchronize Dashboard
            </Link>

            <div className="px-4">
                <Card className="bg-white border-[1.5px] border-slate-200 overflow-hidden shadow-none rounded-sm relative">
                    {/* Header Banner */}
                    <div className="h-40 bg-[#1E2B58] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        {profile.role === 'admin' && (
                            <div className="absolute top-6 right-6">
                                <Badge className="bg-[#C62026] text-white border-none px-4 py-1.5 font-black tracking-[0.2em] uppercase text-[9px] rounded-sm shadow-xl">
                                    Administrative Overseer
                                </Badge>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[#1E2B58] to-transparent" />
                    </div>

                    <CardContent className="relative pt-0 px-8 pb-12">
                        {/* Profile Identity Core */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 mb-10">
                            <div className="relative">
                                <Avatar className="w-40 h-40 border-8 border-white shadow-2xl rounded-sm">
                                    <AvatarImage src={profile.avatar_url} alt={profile.display_name || 'User'} className="object-cover" />
                                    <AvatarFallback className="bg-slate-50 text-[#1E2B58] text-5xl font-black uppercase rounded-none">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#C62026] rounded-sm flex items-center justify-center shadow-lg border-4 border-white">
                                    <Fingerprint className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pb-2">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                                    <div className="w-6 h-px bg-[#C62026]" />
                                    Genie Registered Entity
                                </div>
                                <h1 className="text-4xl font-black text-[#1E2B58] tracking-tighter uppercase leading-tight mb-2">
                                    {profile.display_name || profile.email.split('@')[0]}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-sm">
                                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                            {profile.branch || 'Independent Sector'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-sm">
                                        <Binary className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                            Level {profile.year_of_study || '?'} Academic
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Mission Narrative */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C62026] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#C62026] rounded-full" />
                                        Core Objectives & Narrative
                                    </h3>
                                    <p className="text-base font-medium text-slate-500 leading-relaxed border-l-2 border-slate-100 pl-6 italic">
                                        {profile.bio || "This entity has not yet established a personal mission narrative within the Genie core system. Operational data remains standard."}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-slate-50">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C62026] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#C62026] rounded-full" />
                                        Neutral Communication Nodes
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm flex items-center gap-4 group hover:border-[#1E2B58] transition-all">
                                            <Mail className="w-4 h-4 text-slate-300 group-hover:text-[#1E2B58]" />
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Standard Node</p>
                                                <p className="text-xs font-bold text-[#1E2B58] truncate">{profile.email}</p>
                                            </div>
                                        </div>
                                        {profile.professional_email && (
                                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm flex items-center gap-4 group hover:border-[#C62026] transition-all">
                                                <Briefcase className="w-4 h-4 text-slate-300 group-hover:text-[#C62026]" />
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Enterprise Link</p>
                                                    <p className="text-xs font-bold text-[#1E2B58] truncate">{profile.professional_email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Digital Signatures / Socials */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="bg-[#1E2B58]/5 border-[1.5px] border-[#1E2B58]/10 p-8 rounded-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1E2B58] mb-6 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Vector Connectivity
                                    </h3>
                                    <div className="space-y-3">
                                        {socialLinks.length > 0 ? socialLinks.map((link, idx) => (
                                            <a
                                                key={idx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-sm hover:-translate-y-1 hover:shadow-lg transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <link.icon className={`w-4 h-4 ${link.color}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E2B58] group-hover:text-[#C62026] transition-colors">{link.label}</span>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#C62026] transition-colors" />
                                            </a>
                                        )) : (
                                            <div className="py-6 text-center border-[1.5px] border-dashed border-slate-200 rounded-sm">
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Vectors Defined</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 border-[1.5px] border-dashed border-slate-200 rounded-sm text-center">
                                    <div className="w-12 h-12 rounded-sm bg-slate-50 mx-auto mb-4 flex items-center justify-center">
                                        <Award className="w-6 h-6 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Credential Repository Offline</p>
                                    <p className="text-[8px] font-medium text-slate-300 mt-1 uppercase tracking-widest leading-relaxed px-4">Detailed academic certifications will be visible in System V3.0</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {/* Bottom Geometric Accents */}
                    <div className="absolute bottom-0 right-0 w-32 h-1 bg-[#C62026]" />
                    <div className="absolute bottom-0 right-32 w-32 h-1 bg-[#1E2B58]" />
                </Card>
            </div>
        </div>
    )
} 
