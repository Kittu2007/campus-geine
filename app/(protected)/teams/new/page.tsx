'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, X, Loader2, Rocket } from 'lucide-react'
import Link from 'next/link'

const skillSuggestions = [
    'React', 'Next.js', 'Python', 'Machine Learning', 'UI/UX Design',
    'Node.js', 'Flutter', 'Java', 'C++', 'Data Science', 'Figma',
    'MongoDB', 'PostgreSQL', 'DevOps', 'AWS', 'Blockchain',
]

export default function NewTeamPage() {
    const { user: firebaseUser } = useAuth()
    const router = useRouter()
    const [hackathonName, setHackathonName] = useState('')
    const [eventUrl, setEventUrl] = useState('')
    const [eventDate, setEventDate] = useState('')
    const [description, setDescription] = useState('')
    const [teamSize, setTeamSize] = useState('3')
    const [skills, setSkills] = useState<string[]>([])
    const [skillInput, setSkillInput] = useState('')
    const [loading, setLoading] = useState(false)

    const addSkill = (skill: string) => {
        const s = skill.trim()
        if (s && !skills.includes(s)) {
            setSkills([...skills, s])
        }
        setSkillInput('')
    }

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!hackathonName || !description) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            if (!firebaseUser) throw new Error('Not authenticated')

            const { error } = await supabase.from('hackathon_teams').insert({
                creator_id: firebaseUser.uid,
                hackathon_name: hackathonName,
                event_url: eventUrl || null,
                event_date: eventDate || null,
                required_skills: skills.length > 0 ? skills : null,
                team_size_needed: parseInt(teamSize),
                description,
                status: 'open',
            })

            if (error) throw error
            toast.success('Team listing created!')
            router.refresh() // Invalidate router cache so the listing updates
            router.push('/teams')
        } catch (err) {
            toast.error('Failed to create team listing')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/teams" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to teams
            </Link>

            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-400" />
                        Create Team Listing
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Hackathon Name *</Label>
                            <Input
                                value={hackathonName}
                                onChange={e => setHackathonName(e.target.value)}
                                placeholder="e.g., Smart India Hackathon 2025"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Event Date</Label>
                                <Input
                                    type="date"
                                    value={eventDate}
                                    onChange={e => setEventDate(e.target.value)}
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Team Size Needed</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={teamSize}
                                    onChange={e => setTeamSize(e.target.value)}
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Event URL</Label>
                            <Input
                                value={eventUrl}
                                onChange={e => setEventUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Required Skills</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                                    placeholder="Add a skill..."
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                                <Button type="button" variant="outline" onClick={() => addSkill(skillInput)} className="shrink-0">
                                    Add
                                </Button>
                            </div>
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {skills.map(skill => (
                                        <Badge key={skill} className="bg-purple-500/15 text-purple-300 border-purple-500/20 gap-1">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {skillSuggestions.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => addSkill(s)}
                                        className="px-2 py-0.5 rounded text-xs bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
                                    >
                                        + {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Description *</Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe what your team is building and what kind of teammates you need..."
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Post Team Listing</span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
