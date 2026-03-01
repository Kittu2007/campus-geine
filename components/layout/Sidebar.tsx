'use client'

import { useAuth } from '@/lib/firebase/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    MessageSquare,
    AlertTriangle,
    BookOpen,
    Users,
    Settings,
    LogOut,
    Brain,
    Shield
} from 'lucide-react'
import Image from 'next/image'

export function Sidebar() {
    const { user, signOut } = useAuth()
    const pathname = usePathname()

    const navLinks = [
        { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
        { href: '/chat', label: 'FAQ bot', icon: MessageSquare },
        { href: '/elin', label: 'ELIN', icon: Brain },
        { href: '/complaints', label: 'Complaints', icon: AlertTriangle },
        { href: '/resources', label: 'Resources', icon: BookOpen },
        { href: '/teams', label: 'Teams', icon: Users },
    ]

    return (
        <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-[#1E2B58] text-white border-r border-[#2A3B73] z-50 shadow-2xl">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-[#2A3B73]">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 flex-shrink-0 bg-white rounded-md p-1 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {/* Static Logo implementation for Sidebar */}
                        <Image src="/anurag-logo.png" alt="Anurag University" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-lg tracking-tight select-none text-white">
                        Campus Genie
                    </span>
                </Link>
            </div>

            {/* Navigation Grid (8px based spacing) */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <div className="text-xs font-semibold text-[#8B98C6] uppercase tracking-wider mb-4 px-2 select-none">
                    Main Menu
                </div>
                {navLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${isActive
                                    ? 'bg-[#C62026] text-white shadow-md shadow-red-900/20'
                                    : 'text-[#B0BCE1] hover:bg-[#2A3B73] hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-medium text-[15px]">{link.label}</span>
                            {/* Subtle active indicator line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            )}
                        </Link>
                    )
                })}

                {/* Admin Check Placeholder - simplified check based on email domain or similar if context doesn't have role */}
                {user?.email?.includes('admin') && (
                    <>
                        <div className="text-xs font-semibold text-[#8B98C6] uppercase tracking-wider mt-8 mb-4 px-2 select-none">
                            Admin Tools
                        </div>
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${pathname.startsWith('/admin')
                                    ? 'bg-[#C62026] text-white shadow-md shadow-red-900/20'
                                    : 'text-[#B0BCE1] hover:bg-[#2A3B73] hover:text-white'
                                }`}
                        >
                            <Shield className={`w-5 h-5 transition-transform duration-200 ${pathname.startsWith('/admin') ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-medium text-[15px]">Dashboard</span>
                        </Link>
                    </>
                )}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-[#2A3B73]">
                <div className="bg-[#2A3B73] rounded-lg p-3 flex flex-col gap-3">
                    <Link href={`/profile/${user?.uid}`} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-1 -m-1 rounded-md transition-colors">
                        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#C62026] to-red-800 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0 leading-none">
                            {user?.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-blue-100 transition-colors">
                                {user?.email}
                            </p>
                            <p className="text-xs text-[#8B98C6] truncate">
                                Anurag University
                            </p>
                        </div>
                    </Link>
                    <div className="h-px bg-white/10 w-full" />
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 text-[#8B98C6] hover:text-red-400 text-sm py-1 transition-colors group w-full px-1"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </aside>
    )
} 
