'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
})

export function useAuth() {
    return useContext(AuthContext)
}

const publicRoutes = ['/', '/login', '/admin-login']

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)

            // Redirect unauthenticated users from protected routes
            if (!firebaseUser && !publicRoutes.includes(pathname)) {
                router.push('/login')
            }
        })

        return () => unsubscribe()
    }, [pathname, router])

    const signOut = async () => {
        await firebaseSignOut(auth)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
