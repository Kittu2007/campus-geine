import Navbar from '@/components/layout/Navbar'

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main className="pb-20 md:pb-0">
                {children}
            </main>
        </div>
    )
}
