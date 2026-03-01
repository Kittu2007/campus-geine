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
import { Users, Calendar, Search, Trash2, ExternalLink, ShieldCheck } from 'lucide-react'

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
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        Moderate Teams
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">Oversee and manage student hackathon team listings</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search teams or skills..."
                        className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-600 shadow-sm h-11 rounded-xl w-full"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-56 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200 border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-slate-100 p-5 rounded-full mb-4">
                            <Users className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No teams found</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-sm">No team listings match your current search criteria or there are no active listings.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(team => (
                        <Card key={team.id} className="h-full bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden hover:border-indigo-200 flex flex-col group">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-700 transition-colors">{team.hackathon_name}</h3>
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold shrink-0 ${team.status === 'open' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                                        {team.status}
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-3 leading-relaxed font-medium">{team.description}</p>

                                {team.required_skills && team.required_skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {team.required_skills.slice(0, 4).map(skill => (
                                            <Badge key={skill} variant="secondary" className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {team.required_skills.length > 4 && (
                                            <Badge variant="secondary" className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                                                +{team.required_skills.length - 4}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-slate-600">
                                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>Need {team.team_size_needed}</span>
                                        </div>
                                        {team.event_date && (
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {new Date(team.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <span className="text-slate-400">Owner:</span>
                                        <span className="flex items-center gap-1.5 bg-blue-50/50 px-2 py-0.5 rounded-full border border-blue-100/50">
                                            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">
                                                {(team.profiles?.display_name || team.profiles?.email || 'U')[0].toUpperCase()}
                                            </div>
                                            {team.profiles?.display_name || team.profiles?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 mt-2">
                                    {team.event_url && (
                                        <a href={team.event_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full bg-white border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-semibold h-9 shadow-sm">
                                                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                                Hackathon
                                            </Button>
                                        </a>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => deleteTeam(team.id)}
                                        className="flex-1 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs font-semibold h-9 shadow-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                                        Delete
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
