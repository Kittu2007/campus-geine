'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Users, Calendar, Globe, Search, Trash2, ExternalLink } from 'lucide-react'

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

export default function AdminTeamsPage() {
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
            .order('created_at', { ascending: false })

        setTeams(data || [])
        setLoading(false)
    }

    const deleteTeam = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this team listing?')) return

        const supabase = createClient()
        const { error } = await supabase.from('hackathon_teams').delete().eq('id', id)

        if (error) {
            toast.error('Failed to delete team')
            console.error(error)
        } else {
            toast.success('Team deleted successfully')
            fetchTeams()
        }
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
                        Manage Teams
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Moderate and manage all student hackathon team listings</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search teams by name, description, or skills..."
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
                        <p className="text-sm text-slate-500 mb-4">There are currently no team listings matching your search.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(team => (
                        <Card key={team.id} className="h-full bg-slate-800/50 border-slate-700/50 transition-all duration-300">
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-white text-lg">{team.hackathon_name}</h3>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className={`text-xs ${team.status === 'open' ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400 border-slate-500/30'} shrink-0 capitalize`}>
                                            {team.status}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30 shrink-0">
                                            {team.team_size_needed} needed
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-3 flex-1">{team.description}</p>

                                {team.required_skills && team.required_skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {team.required_skills.map(skill => (
                                            <Badge key={skill} className="text-[11px] bg-purple-500/15 text-purple-300 border-purple-500/20">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 mb-4 pt-4 border-t border-slate-700/50">
                                    {team.event_date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(team.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    )}
                                    <span className="ml-auto flex items-center gap-1">
                                        Owner:
                                        <span className="text-slate-300 font-medium">{team.profiles?.display_name || team.profiles?.email?.split('@')[0]}</span>
                                    </span>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    {team.event_url && (
                                        <a href={team.event_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Hackathon Link
                                            </Button>
                                        </a>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteTeam(team.id)}
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Team
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
