'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Search, FileText, Video, Link as LinkIcon, Sparkles, ExternalLink } from 'lucide-react'

const subjects = [
    'All', 'Data Structures', 'DBMS', 'Operating Systems', 'Networks',
    'Mathematics', 'Physics', 'English', 'Others',
]

const typeIcons: Record<string, React.ElementType> = {
    pdf: FileText,
    video: Video,
    link: LinkIcon,
    prompt: Sparkles,
}

interface Resource {
    id: string
    title: string
    subject: string
    type: string
    url: string
    description: string | null
    created_at: string
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSubject, setSelectedSubject] = useState('All')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchResources()
    }, [])

    const fetchResources = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false })

        setResources(data || [])
        setLoading(false)
    }

    const filtered = resources.filter(r => {
        const matchesSubject = selectedSubject === 'All' || r.subject === selectedSubject
        const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase())
        return matchesSubject && matchesSearch
    })

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                    Resources Hub
                </h1>
                <p className="text-sm text-slate-400 mt-1">Browse study materials by subject</p>
            </div>

            {/* Search & Filter */}
            <div className="space-y-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..."
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedSubject === subject
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-40 bg-slate-800" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-2">No resources found</h3>
                        <p className="text-sm text-slate-500">
                            {search ? 'Try a different search term.' : 'Resources will appear here once uploaded by admin.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(resource => {
                        const TypeIcon = typeIcons[resource.type] || FileText
                        const isPrompt = resource.type === 'prompt'

                        const CardWrapper = ({ children }: { children: React.ReactNode }) => {
                            if (isPrompt) {
                                return <div className="group h-full">{children}</div>
                            }
                            return (
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group h-full block"
                                >
                                    {children}
                                </a>
                            )
                        }

                        return (
                            <CardWrapper key={resource.id}>
                                <Card className="h-full bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col">
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <TypeIcon className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            {!isPrompt && <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />}
                                        </div>
                                        <h3 className="font-semibold text-white mb-2">{resource.title}</h3>

                                        {resource.description && (
                                            <div className="flex-1 min-h-0 mb-3">
                                                <p className={`text-sm text-slate-400 ${isPrompt ? 'whitespace-pre-wrap rounded-md bg-slate-900/50 p-3 italic' : 'line-clamp-2'}`}>
                                                    {resource.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-auto">
                                            <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
                                                {resource.subject}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {resource.type}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardWrapper>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
