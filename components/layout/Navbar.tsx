'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/firebase/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet, SheetContent, SheetTrigger,
} from '@/components/ui/sheet'
import {
    MessageSquare, AlertTriangle, BookOpen, Users, User,
    LogOut, Menu, Home, Shield, GraduationCap, Brain,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/chat', label: 'FAQ bot', icon: MessageSquare },
    { href: '/elin', label: 'ELIN', icon: Brain },
    { href: '/complaints', label: 'Complaints', icon: AlertTriangle },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/teams', label: 'Teams', icon: Users },
]

export function Navbar() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (user) {
            const supabase = createClient()
            supabase.from('profiles').select('role').eq('id', user.uid).single()
                .then(({ data }) => {
                    if (data?.role === 'admin') setIsAdmin(true)
                })
        }
    }, [user])

    if (!user) return null

    const initials = user.email?.[0].toUpperCase() || 'U'

    return (
        <>
            {/* Desktop Nav (Disabled in favor of Sidebar) */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 z-50 hidden items-center px-6 transition-all duration-200 ease-in-out shadow-sm">
                <Link href="/dashboard" className="flex items-center gap-2 mr-8">
                    <img src="/anurag-logo.png" alt="Anurag Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg text-slate-800">Campus Genie</span>
                </Link>

                <div className="flex items-center gap-1">
                    {[
                        ...navLinks,
                        { href: `/profile/${user.uid}`, label: 'Profile', icon: User }
                    ].map(link => {
                        const Icon = link.icon
                        const active = pathname === link.href
                        // Apply custom indigo styling for the ELIN tab
                        const isElin = link.href === '/elin'

                        let baseClasses = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out '

                        if (active) {
                            baseClasses += isElin
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'bg-blue-50 text-blue-700 shadow-sm'
                        } else {
                            baseClasses += isElin
                                ? 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
                        }

                        return (
                            <Link key={link.href} href={link.href} className={baseClasses}>
                                <Icon className="w-4 h-4" /> {link.label}
                                {isElin && <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4 bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100/50">NEW</Badge>}
                            </Link>
                        )
                    })}

                    {isAdmin && (
                        <Link href="/admin"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${pathname.startsWith('/admin') ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'}`}>
                            <Shield className="w-4 h-4" /> Admin
                        </Link>
                    )}
                </div>

                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-100 transition-all duration-200 ease-in-out">
                                <Avatar className="w-7 h-7 shadow-sm">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-slate-700 max-w-[150px] truncate">{user.email}</span>
                                {isAdmin && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">Admin</Badge>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border-slate-200 w-48 shadow-md rounded-xl">
                            <DropdownMenuItem asChild className="text-slate-700 focus:bg-slate-50 focus:text-blue-700 cursor-pointer">
                                <Link href={`/profile/${user.uid}`}><User className="w-4 h-4 mr-2" /> My Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-slate-700 focus:bg-slate-50 focus:text-blue-700 cursor-pointer">
                                <Link href="/profile/edit"><User className="w-4 h-4 mr-2" /> Edit Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem onClick={signOut} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            {/* Mobile Top Bar */}
            <nav className="fixed top-0 left-0 right-0 h-14 bg-white/70 backdrop-blur-md border-b border-slate-200 z-50 flex lg:hidden items-center px-4 shadow-sm">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <img src="/anurag-logo.png" alt="Anurag Logo" className="w-6 h-6 object-contain" />
                    <span className="font-bold text-slate-800">Campus Genie</span>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    {isAdmin && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">Admin</Badge>}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild><Button variant="ghost" size="sm" className="text-slate-600"><Menu className="w-5 h-5" /></Button></SheetTrigger>
                        <SheetContent side="right" className="bg-white border-slate-200 w-64 p-4">
                            <div className="flex items-center gap-3 mb-6 mt-4">
                                <Avatar className="w-10 h-10 shadow-sm"><AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">{initials}</AvatarFallback></Avatar>
                                <div><p className="text-sm font-medium text-slate-800 truncate">{user.email}</p><p className="text-xs text-slate-500">Student</p></div>
                            </div>
                            <div className="space-y-1">
                                <Link href={`/profile/${user.uid}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"><User className="w-4 h-4" /> My Profile</Link>
                                <Link href="/profile/edit" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"><User className="w-4 h-4" /> Edit Profile</Link>
                                {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-700 hover:bg-amber-50 transition-colors"><Shield className="w-4 h-4" /> Admin Panel</Link>}
                                <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>

            {/* Mobile Bottom Tab Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 flex lg:hidden items-center justify-around px-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {navLinks.map(link => {
                    const Icon = link.icon
                    const active = pathname === link.href
                    const isElin = link.href === '/elin'

                    let baseClasses = 'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 ease-in-out '

                    if (active) {
                        baseClasses += isElin
                            ? 'text-indigo-700 bg-indigo-50 shadow-sm'
                            : 'text-blue-700 bg-blue-50 shadow-sm'
                    } else {
                        baseClasses += isElin
                            ? 'text-indigo-500 hover:text-indigo-600'
                            : 'text-slate-500 hover:text-blue-600'
                    }

                    return (
                        <Link key={link.href} href={link.href} className={baseClasses}>
                            <Icon className="w-5 h-5" />
                            <span className="text-[9px] font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}
