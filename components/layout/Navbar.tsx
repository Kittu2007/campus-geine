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
    LogOut, Menu, Home, Shield, GraduationCap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
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
            {/* Desktop Nav */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 z-50 hidden md:flex items-center px-6">
                <Link href="/dashboard" className="flex items-center gap-2 mr-8">
                    <GraduationCap className="w-6 h-6 text-blue-400" />
                    <span className="font-bold text-lg text-white">Campus OS</span>
                </Link>

                <div className="flex items-center gap-1">
                    {navLinks.map(link => {
                        const Icon = link.icon
                        const active = pathname === link.href
                        return (
                            <Link key={link.href} href={link.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <Icon className="w-4 h-4" /> {link.label}
                            </Link>
                        )
                    })}

                    {isAdmin && (
                        <Link href="/admin"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.startsWith('/admin') ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <Shield className="w-4 h-4" /> Admin
                        </Link>
                    )}
                </div>

                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-800">
                                <Avatar className="w-7 h-7">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-slate-300 max-w-[150px] truncate">{user.email}</span>
                                {isAdmin && <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/20">Admin</Badge>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700 w-48">
                            <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-700 focus:text-white">
                                <Link href={`/profile/${user.uid}`}><User className="w-4 h-4 mr-2" /> My Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-700 focus:text-white">
                                <Link href="/profile/edit"><User className="w-4 h-4 mr-2" /> Edit Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem onClick={signOut} className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            {/* Mobile Top Bar */}
            <nav className="fixed top-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 z-50 flex md:hidden items-center px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-white">Campus OS</span>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    {isAdmin && <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/20">Admin</Badge>}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild><Button variant="ghost" size="sm"><Menu className="w-5 h-5" /></Button></SheetTrigger>
                        <SheetContent side="right" className="bg-slate-900 border-slate-800 w-64 p-4">
                            <div className="flex items-center gap-3 mb-6 mt-4">
                                <Avatar className="w-10 h-10"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{initials}</AvatarFallback></Avatar>
                                <div><p className="text-sm font-medium text-white truncate">{user.email}</p><p className="text-xs text-slate-400">Student</p></div>
                            </div>
                            <div className="space-y-1">
                                <Link href={`/profile/${user.uid}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"><User className="w-4 h-4" /> My Profile</Link>
                                <Link href="/profile/edit" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"><User className="w-4 h-4" /> Edit Profile</Link>
                                {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-slate-800"><Shield className="w-4 h-4" /> Admin Panel</Link>}
                                <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>

            {/* Mobile Bottom Tab Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 z-50 flex md:hidden items-center justify-around px-2">
                {navLinks.map(link => {
                    const Icon = link.icon
                    const active = pathname === link.href
                    return (
                        <Link key={link.href} href={link.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${active ? 'text-blue-400' : 'text-slate-500'}`}>
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}
