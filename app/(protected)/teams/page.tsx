'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Calendar, Globe, Search, Flame, ArrowRight, Target, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Team {
    id: string
    hackathon_name: string
    event_url: string | null
    event_date: string | null
    required_skills: string[] | null
    team_size_needed: number
    description: string
    status: string
    created_at: string
    creator_id: string
    profiles: { display_name: string | null; email: string } | null
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('hackathon_teams')
            .select('*, profiles:creator_id(display_name, email)')
            .eq('status', 'open')
            .order('created_at', { ascending: false })

        setTeams(data || [])
        setLoading(false)
    }

    const filtered = teams.filter(t => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            t.hackathon_name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.required_skills?.some(s => s.toLowerCase().includes(q))
        )
    })

    return (
        <div className="max-w-7xl mx-auto px-1 py-8 animate-slide-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-[#C62026]" />
                        Collaboration Core
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter uppercase">
                        Hackathon <span className="text-[#C62026]">Teams</span>
                    </h1>
                </div>
                <Link href="/teams/new">
                    <Button className="bg-[#1E2B58] hover:bg-[#151f42] text-white px-8 h-14 rounded-sm shadow-xl hover:animate-pulse-interlock flex items-center gap-2 uppercase font-black tracking-widest text-xs">
                        <Plus className="w-5 h-5" /> Assemble Squad
                    </Button>
                </Link>
            </div>

            {/* Search Matrix */}
            <div className="px-4 mb-10">
                <div className="relative max-w-2xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E2B58] transition-colors" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter by hackathon, skill, or project scope..."
                        className="pl-12 py-7 rounded-sm border-[1.5px] border-slate-200 bg-white text-[#1E2B58] placeholder:text-slate-400 shadow-sm focus-visible:ring-[#1E2B58] focus-visible:border-[#1E2B58] transition-all text-base font-medium"
                    />
                </div>
            </div>

            {/* Teams Grid */}
            <div className="px-4">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-64 bg-slate-100 rounded-sm" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center border-[1.5px] border-dashed border-slate-200 bg-slate-50/50 rounded-sm">
                        <div className="w-16 h-16 rounded-sm bg-white border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-[#1E2B58] tracking-tighter uppercase mb-2 italic">No Squads Assembled</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initialize a new team or adjust filter parameters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-slate-100 p-px border border-slate-200 overflow-hidden">
                        {filtered.map(team => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                                <Card className="h-full bg-white border-none rounded-none shadow-none group relative overflow-hidden transition-all duration-300 hover:z-10 hover:shadow-[0_10px_40px_rgba(30,43,88,0.12)]">
                                    <CardContent className="p-8 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-sm">
                                                    <Flame className="w-3.5 h-3.5 text-[#C62026]" />
                                                    <span className="text-[9px] font-black uppercase text-[#C62026] tracking-widest">Recruiting</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-[#C62026] transition-colors">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Details</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-[#1E2B58] tracking-tighter uppercase mb-4 group-hover:text-[#C62026] transition-colors line-clamp-2">
                                                {team.hackathon_name}
                                            </h3>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase tracking-wide">
                                                        {team.event_date ? new Date(team.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                    <Target className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase tracking-wide">
                                                        {team.team_size_needed} Slots Available
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-8">
                                                {team.required_skills?.slice(0, 3).map((skill, si) => (
                                                    <span key={si} className="px-2 py-1 bg-slate-50 border border-slate-200 text-[9px] font-black uppercase text-slate-500 tracking-widest rounded-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(team.required_skills?.length || 0) > 3 && (
                                                    <span className="px-2 py-1 bg-slate-50 border border-slate-200 text-[9px] font-black uppercase text-slate-300 tracking-widest rounded-sm">
                                                        +{(team.required_skills?.length || 0) - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-sm bg-[#1E2B58] flex items-center justify-center text-white text-[10px] font-black uppercase">
                                                {team.profiles?.display_name?.charAt(0) || team.profiles?.email.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#1E2B58] uppercase tracking-widest leading-none mb-1">
                                                    {team.profiles?.display_name || 'Anonymous Architect'}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Lead Coordinator</p>
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Geometric Hover Accent */}
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C62026] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 
