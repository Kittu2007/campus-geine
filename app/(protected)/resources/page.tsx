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
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    Resources Hub
                </h1>
                <p className="text-base text-slate-500 mt-2">Browse study materials, previous papers, and AI prompts by subject.</p>
            </div>

            {/* Search & Filter */}
            <div className="space-y-6 mb-8">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources by title..."
                        className="pl-12 py-6 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all text-base"
                    />
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-4 border-b border-slate-200 pb-2">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 ${selectedSubject === subject
                                ? 'text-blue-700'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {subject}
                            <span className={`absolute bottom-[-10px] left-0 w-full h-1 bg-blue-600 rounded-t-md transform origin-left transition-transform duration-300 ease-out ${selectedSubject === subject ? 'scale-x-100' : 'scale-x-0'}`} />
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-48 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200 border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <BookOpen className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No resources found</h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                            {search ? 'Try a different search term or subject filter.' : 'Resources will appear here once uploaded by the administration.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <Card className={`h-full bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col rounded-2xl overflow-hidden ${!isPrompt ? 'cursor-pointer hover:border-blue-300' : ''}`}>
                                    <CardContent className="p-6 flex-1 flex flex-col relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <TypeIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            {!isPrompt && <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{resource.title}</h3>

                                        {resource.description && (
                                            <div className="flex-1 min-h-0 mb-4">
                                                <p className={`text-sm text-slate-600 ${isPrompt ? 'whitespace-pre-wrap rounded-xl bg-slate-50 border border-slate-100 p-4 font-mono text-xs' : 'line-clamp-3 leading-relaxed'}`}>
                                                    {resource.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-auto pt-2">
                                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium px-2.5 py-1 rounded-md">
                                                {resource.subject}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs capitalize border-slate-300 text-slate-500 px-2.5 py-1 rounded-md bg-white">
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
