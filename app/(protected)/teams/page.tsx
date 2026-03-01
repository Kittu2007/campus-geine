'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Calendar, Globe, Search, Flame, User, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/firebase/AuthContext'
import { toast } from 'sonner'

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
    const { user } = useAuth()
    const [userRequests, setUserRequests] = useState<Record<string, string>>({}) // teamId -> status
    const [userMemberships, setUserMemberships] = useState<string[]>([]) // array of teamIds
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchTeams()
        if (user) {
            fetchUserStatus()
        }
    }, [user])

    const fetchUserStatus = async () => {
        const supabase = createClient()

        // Fetch requests
        const { data: reqs } = await supabase
            .from('team_requests')
            .select('team_id, status')
            .eq('requester_id', user!.uid)

        const reqMap: Record<string, string> = {}
        reqs?.forEach(r => reqMap[r.team_id] = r.status)
        setUserRequests(reqMap)

        // Fetch memberships
        const { data: members } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user!.uid)

        setUserMemberships(members?.map(m => m.team_id) || [])
    }

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
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        Hackathon Teams
                    </h1>
                    <p className="text-base text-slate-500 mt-2">Find teammates or post your own listing for upcoming hackathons.</p>
                </div>
                <Link href="/teams/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:scale-105 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> Create Team
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by hackathon name, required skill..."
                    className="pl-12 py-6 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm focus-visible:ring-indigo-600 focus-visible:border-indigo-600 transition-all text-base"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-56 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200 border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-indigo-100 p-4 rounded-full mb-4">
                            <Users className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No teams found</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-sm">Be the first to create a team listing and find the perfect teammates!</p>
                        <Link href="/teams/new">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Create a Team</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(team => {
                        const isUrgent = team.team_size_needed >= 3
                        const isCreator = user?.uid === team.creator_id
                        const requestStatus = userRequests[team.id]
                        const isMember = userMemberships.includes(team.id)

                        const handleJoinRequest = async (e: React.MouseEvent) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!user) return

                            setActionLoading(team.id)
                            try {
                                const supabase = createClient()
                                const { error } = await supabase.from('team_requests').insert({
                                    team_id: team.id,
                                    requester_id: user.uid,
                                    message: 'I would like to join your team!',
                                })
                                if (error) throw error
                                toast.success('Join request sent!')
                                fetchUserStatus()
                            } catch {
                                toast.error('Failed to send request')
                            } finally {
                                setActionLoading(null)
                            }
                        }

                        return (
                            <div key={team.id} className="h-full">
                                <Card className={`h-full bg-white transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md flex flex-col rounded-2xl overflow-hidden relative ${isUrgent
                                    ? 'border-2 border-red-400 shadow-sm'
                                    : 'border border-slate-200 shadow-sm hover:border-indigo-300'
                                    }`}>
                                    <CardContent className="p-6 flex-1 flex flex-col relative">
                                        {isUrgent && (
                                            <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                <Flame className="w-3 h-3" /> Urgent
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between mb-4 gap-4 mt-2 sm:mt-0">
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{team.hackathon_name}</h3>
                                            <Badge variant="outline" className={`shrink-0 border bg-white ${isUrgent ? 'text-red-700 border-red-200' : 'text-indigo-700 border-indigo-200'}`}>
                                                {team.team_size_needed} needed
                                            </Badge>
                                        </div>

                                        <div className="flex-1 min-h-0 mb-5">
                                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{team.description}</p>
                                        </div>

                                        {team.required_skills && team.required_skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {team.required_skills.map(skill => (
                                                    <Badge key={skill} className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 font-medium mt-auto pt-4 border-t border-slate-100">
                                            {team.event_date && (
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(team.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                            {team.event_url && (
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:text-blue-600 transition-colors">
                                                    <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                                                    Event Link
                                                </span>
                                            )}
                                            <div className="w-full flex items-center justify-between mt-1">
                                                <Link
                                                    href={`/profile/${team.creator_id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 group/author hover:text-indigo-600 transition-colors"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0 shadow-sm group-hover/author:scale-110 transition-transform">
                                                        {(team.profiles?.display_name || team.profiles?.email || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <span className="truncate max-w-[100px]">
                                                        by {team.profiles?.display_name || team.profiles?.email?.split('@')[0]}
                                                    </span>
                                                </Link>

                                                {!isCreator && !isMember && !requestStatus && (
                                                    <Button
                                                        size="sm"
                                                        onClick={handleJoinRequest}
                                                        disabled={actionLoading === team.id}
                                                        className="h-8 px-3 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                                                    >
                                                        {actionLoading === team.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                                                        Join
                                                    </Button>
                                                )}
                                                {requestStatus && (
                                                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 capitalize text-[10px]">
                                                        {requestStatus}
                                                    </Badge>
                                                )}
                                                {isMember && (
                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">
                                                        Member
                                                    </Badge>
                                                )}
                                                {isCreator && (
                                                    <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
                                                        Owner
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={`/teams/${team.id}`} className="absolute inset-0 z-0" aria-label="View team details" />
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
