'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    GraduationCap,
    LayoutDashboard,
    MessageCircle,
    BookOpen,
    Users,
    AlertTriangle,
    User,
    LogOut,
    Shield,
    Menu,
    X,
} from 'lucide-react'

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/teams', label: 'Teams', icon: Users },
    { href: '/complaints', label: 'Complaints', icon: AlertTriangle },
]

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<{ id: string; email: string; display_name?: string; avatar_url?: string; role?: string } | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const supabase = createClient()
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name, avatar_url, role')
                    .eq('id', authUser.id)
                    .single()
                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    display_name: profile?.display_name,
                    avatar_url: profile?.avatar_url,
                    role: profile?.role,
                })
            }
        }
        fetchUser()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const initials = user?.display_name
        ? user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user?.email?.[0]?.toUpperCase() || '?'

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white hidden sm:block">Campus OS</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => {
                                const Icon = link.icon
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-blue-500/15 text-blue-400'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-2">
                            {user?.role === 'admin' && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
                                        <Shield className="w-4 h-4 mr-1" />
                                        <span className="hidden sm:inline">Admin</span>
                                    </Button>
                                </Link>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9 border-2 border-slate-600">
                                            <AvatarImage src={user?.avatar_url} alt={user?.display_name || 'User'} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-slate-200" align="end">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user?.display_name || 'Student'}</p>
                                        <p className="text-xs text-slate-400">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                                        <Link href={`/profile/${user?.id || ''}`}>
                                            <User className="w-4 h-4 mr-2" /> View Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                                        <Link href="/profile/edit">
                                            <User className="w-4 h-4 mr-2" /> Edit Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden text-slate-400"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map(link => {
                                const Icon = link.icon
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-blue-500/15 text-blue-400'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Tab Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
                <div className="flex items-center justify-around h-16">
                    {navLinks.map(link => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-all ${isActive ? 'text-blue-400' : 'text-slate-500'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{link.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
