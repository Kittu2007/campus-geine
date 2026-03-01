'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Search, FileText, Video, Link as LinkIcon, Sparkles, ExternalLink, ArrowRight } from 'lucide-react'

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
        <div className="max-w-7xl mx-auto px-1 py-8 animate-slide-in">
            {/* Header Section */}
            <header className="mb-10 px-4">
                <div className="flex items-center gap-2 mb-2 text-[#C62026] font-bold text-xs uppercase tracking-[0.2em]">
                    <div className="w-8 h-px bg-[#C62026]" />
                    Academic Repository
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1E2B58] tracking-tighter uppercase mb-4">
                    Resources <span className="text-[#C62026]">Vault</span>
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                    Access high-fidelity academic assets and AI-driven study scripts. Precise categorization ensured via geometric structure.
                </p>
            </header>

            {/* Search & Filter Matrix */}
            <div className="px-4 mb-10 space-y-6">
                <div className="relative max-w-2xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E2B58] transition-colors" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search system by title or metadata..."
                        className="pl-12 py-7 rounded-sm border-[1.5px] border-slate-200 bg-white text-[#1E2B58] placeholder:text-slate-400 shadow-sm focus-visible:ring-[#1E2B58] focus-visible:border-[#1E2B58] transition-all text-base font-medium"
                    />
                </div>

                <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-6">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-sm border ${selectedSubject === subject
                                ? 'bg-[#1E2B58] border-[#1E2B58] text-white'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-[#C62026] hover:text-[#C62026]'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Matrix */}
            <div className="px-4">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-48 bg-slate-100 rounded-sm" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center border-[1.5px] border-dashed border-slate-200 bg-slate-50/50 rounded-sm">
                        <div className="w-16 h-16 rounded-sm bg-white border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-[#1E2B58] tracking-tighter uppercase mb-2 italic">Zero Matches Found</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Adjust search parameters or category matrix</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 bg-slate-100 p-px border border-slate-200 overflow-hidden">
                        {filtered.map(resource => {
                            const Icon = typeIcons[resource.type] || FileText
                            return (
                                <a
                                    key={resource.id}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative bg-white h-full transition-all duration-300 hover:z-10 hover:shadow-[0_10px_40px_rgba(30,43,88,0.12)]"
                                >
                                    <div className="p-6 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-10 h-10 flex items-center justify-center rounded-sm bg-slate-50 border border-slate-200 group-hover:bg-[#C62026]/5 group-hover:border-[#C62026]/20 transition-all`}>
                                                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#C62026] transition-colors" />
                                                </div>
                                                <div className="bg-[#1E2B58]/5 px-2 py-0.5 rounded-sm border border-[#1E2B58]/10">
                                                    <span className="text-[9px] font-black uppercase text-[#1E2B58] tracking-widest leading-none">
                                                        {resource.subject}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="font-black text-[#1E2B58] text-lg tracking-tight leading-tight mb-3 group-hover:text-[#C62026] transition-colors">
                                                {resource.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                {resource.description || 'Secure academic material synchronized with the Genie core system.'}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                ID: {resource.id.slice(0, 8)}
                                            </span>
                                            <div className="flex items-center gap-1 text-[#C62026] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                                Access <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Geometric Hover Accent */}
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C62026] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </a>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
} 
