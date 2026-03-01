'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
    ArrowLeft, Calendar, Globe, Users, Send, Check, X, Loader2, User
} from 'lucide-react'
import Link from 'next/link'

interface Team {
    id: string
    hackathon_name: string
    event_url: string | null
    event_date: string | null
    required_skills: string[] | null
    team_size_needed: number
    description: string
    status: string
    creator_id: string
    created_at: string
    profiles: {
        id: string;
        display_name: string | null;
        email: string;
        avatar_url: string | null;
    } | null
}

interface TeamRequest {
    id: string
    requester_id: string
    message: string
    status: string
    created_at: string
    profiles: {
        display_name: string | null;
        email: string;
        avatar_url: string | null;
        skills: string[] | null;
    } | null
}

export default function TeamDetailPage() {
    const { user: firebaseUser } = useAuth()
    const params = useParams()
    const teamId = params.id as string
    const [team, setTeam] = useState<Team | null>(null)
    const [requests, setRequests] = useState<TeamRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [hasRequested, setHasRequested] = useState(false)

    const userId = firebaseUser?.uid || null

    useEffect(() => {
        fetchTeam()
    }, [teamId])

    const fetchTeam = async () => {
        const supabase = createClient()

        const { data: teamData } = await supabase
            .from('hackathon_teams')
            .select('*, profiles:creator_id(id, display_name, email, avatar_url)')
            .eq('id', teamId)
            .single()

        setTeam(teamData)

        // Check if user already requested
        if (firebaseUser) {
            const { data: existingReq } = await supabase
                .from('team_requests')
                .select('id')
                .eq('team_id', teamId)
                .eq('requester_id', firebaseUser.uid)
                .limit(1)

            setHasRequested((existingReq || []).length > 0)
        }

        // Load requests if creator
        if (teamData && firebaseUser && teamData.creator_id === firebaseUser.uid) {
            const { data: reqData } = await supabase
                .from('team_requests')
                .select('*, profiles:requester_id(display_name, email, avatar_url, skills)')
                .eq('team_id', teamId)
                .order('created_at', { ascending: false })

            setRequests(reqData || [])
        }

        setLoading(false)
    }

    const sendJoinRequest = async () => {
        if (!message.trim()) {
            toast.error('Please write a pitch message')
            return
        }
        setSending(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('team_requests').insert({
                team_id: teamId,
                requester_id: userId!,
                message: message.trim(),
            })
            if (error) throw error
            toast.success('Join request sent!')
            setHasRequested(true)
            setMessage('')
        } catch {
            toast.error('Failed to send request')
        } finally {
            setSending(false)
        }
    }

    const updateRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
        const supabase = createClient()
        const { error } = await supabase
            .from('team_requests')
            .update({ status })
            .eq('id', requestId)

        if (error) {
            toast.error('Failed to update request')
        } else {
            if (status === 'accepted') {
                // Add to team_members
                const { error: memberError } = await supabase
                    .from('team_members')
                    .insert({ team_id: teamId, user_id: requests.find(r => r.id === requestId)?.requester_id })

                if (memberError) {
                    toast.error('Failed to add member to team')
                } else {
                    // Decrement team_size_needed
                    const newSize = Math.max(0, (team?.team_size_needed || 0) - 1)
                    const { error: updateError } = await supabase
                        .from('hackathon_teams')
                        .update({
                            team_size_needed: newSize,
                            status: newSize === 0 ? 'closed' : 'open'
                        })
                        .eq('id', teamId)

                    if (updateError) toast.error('Failed to update team size')
                }
            }
            toast.success(`Request ${status}`)
            fetchTeam()
        }
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
                <Skeleton className="h-8 w-48 bg-slate-800" />
                <Skeleton className="h-64 bg-slate-800" />
            </div>
        )
    }

    if (!team) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 text-center">
                <p className="text-slate-400">Team not found</p>
            </div>
        )
    }

    const isCreator = userId === team.creator_id

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Link href="/teams" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to teams
            </Link>

            <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white">{team.hackathon_name}</h1>
                        <Badge variant="outline" className={team.status === 'open' ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400'}>
                            {team.status}
                        </Badge>
                    </div>

                    <p className="text-slate-300 mb-4 whitespace-pre-wrap">{team.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                        <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> {team.team_size_needed} members needed
                        </span>
                        {team.event_date && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(team.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        {team.event_url && (
                            <a href={team.event_url.startsWith('http') ? team.event_url : `https://${team.event_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:underline">
                                <Globe className="w-4 h-4" /> Event Link
                            </a>
                        )}
                    </div>

                    {team.required_skills && team.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {team.required_skills.map(skill => (
                                <Badge key={skill} className="bg-purple-500/15 text-purple-300 border-purple-500/20">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                        <Link href={`/profile/${team.creator_id}`} className="flex items-center gap-2 group hover:text-indigo-400 transition-colors">
                            <Avatar className="w-8 h-8 border border-slate-600 group-hover:border-indigo-500/50 transition-colors">
                                <AvatarImage src={team.profiles?.avatar_url || ''} />
                                <AvatarFallback className="bg-slate-700 text-[10px] text-white">
                                    {(team.profiles?.display_name || team.profiles?.email || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                                <p className="text-slate-500">Posted by</p>
                                <p className="font-medium text-slate-300 group-hover:text-indigo-400 transition-colors">
                                    {team.profiles?.display_name || team.profiles?.email?.split('@')[0]}
                                </p>
                            </div>
                        </Link>
                        <div className="text-xs text-slate-500 ml-auto">
                            {new Date(team.created_at).toLocaleDateString('en-IN')}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Join Request Form */}
            {userId && !isCreator && !hasRequested && team.status === 'open' && (
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Send Join Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Write a short pitch about why you'd be a great teammate..."
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{message.length}/500</span>
                            <Button onClick={sendJoinRequest} disabled={sending} className="bg-purple-600 hover:bg-purple-700">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {hasRequested && !isCreator && (
                <Card className="bg-emerald-500/10 border-emerald-500/20">
                    <CardContent className="p-4 text-center text-emerald-400 text-sm">
                        ✅ You&apos;ve already sent a join request for this team.
                    </CardContent>
                </Card>
            )}

            {/* Creator: View Requests */}
            {isCreator && (
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Join Requests ({requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {requests.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No requests yet</p>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                    <div className="flex items-start justify-between mb-2">
                                        <Link href={`/profile/${req.requester_id}`} className="flex items-center gap-2 group/requester hover:text-indigo-400 transition-colors">
                                            <Avatar className="w-8 h-8 border border-slate-600 group-hover/requester:border-indigo-500/50 transition-all">
                                                <AvatarImage src={req.profiles?.avatar_url || ''} />
                                                <AvatarFallback className="bg-slate-600 text-[10px] text-white">
                                                    {(req.profiles?.display_name || req.profiles?.email || 'U')[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-white text-sm group-hover/requester:text-indigo-400 transition-colors">
                                                    {req.profiles?.display_name || req.profiles?.email?.split('@')[0]}
                                                </p>
                                                {req.profiles?.skills && req.profiles.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                        {req.profiles.skills.slice(0, 3).map(s => (
                                                            <span key={s} className="text-[9px] px-1.5 py-0 bg-slate-800 text-slate-400 rounded-full border border-slate-700">{s}</span>
                                                        ))}
                                                        {req.profiles.skills.length > 3 && <span className="text-[9px] text-slate-500">+{req.profiles.skills.length - 3}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant="outline" className={`text-[10px] capitalize ml-2 ${req.status === 'accepted' ? 'text-emerald-400 border-emerald-500/20' :
                                                req.status === 'rejected' ? 'text-red-400 border-red-500/20' : 'text-amber-400 border-amber-500/20'
                                                }`}>
                                                {req.status}
                                            </Badge>
                                        </Link>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-3">{req.message}</p>
                                    {req.status === 'pending' && (
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={() => updateRequest(req.id, 'rejected')} className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                                                <X className="w-3 h-3 mr-1" /> Reject
                                            </Button>
                                            <Button size="sm" onClick={() => updateRequest(req.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">
                                                <Check className="w-3 h-3 mr-1" /> Accept
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
