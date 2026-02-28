'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Calendar, Globe, Search } from 'lucide-react'
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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-400" />
                        Hackathon Teams
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Find teammates or post your own listing</p>
                </div>
                <Link href="/teams/new">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" /> Create Team
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by hackathon name, skill..."
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-48 bg-slate-800" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-2">No teams found</h3>
                        <p className="text-sm text-slate-500 mb-4">Be the first to create a team listing!</p>
                        <Link href="/teams/new">
                            <Button className="bg-purple-600 hover:bg-purple-700">Create a Team</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(team => (
                        <Link key={team.id} href={`/teams/${team.id}`}>
                            <Card className="h-full bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-white text-lg">{team.hackathon_name}</h3>
                                        <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30 shrink-0">
                                            {team.team_size_needed} needed
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{team.description}</p>

                                    {team.required_skills && team.required_skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {team.required_skills.map(skill => (
                                                <Badge key={skill} className="text-[11px] bg-purple-500/15 text-purple-300 border-purple-500/20">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        {team.event_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(team.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                        {team.event_url && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                Event Link
                                            </span>
                                        )}
                                        <span className="ml-auto">
                                            by {team.profiles?.display_name || team.profiles?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
