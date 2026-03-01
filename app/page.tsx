import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  AlertTriangle,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'Academic Support',
    description: 'Get instant answers for your academics with our AI-powered FAQ bot.',
    color: 'from-blue-600 to-blue-700',
  },
  {
    icon: AlertTriangle,
    title: 'Infrastructure Complaints',
    description: 'Report broken equipment or place a complaint with photo evidence.',
    color: 'from-red-600 to-red-700',
  },
  {
    icon: Users,
    title: 'Hackathon Team Connect',
    description: 'Find teammates with complementary skills for your next hackathon.',
    color: 'from-indigo-600 to-indigo-700',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050A18] overflow-hidden font-sans text-slate-200 selection:bg-red-500/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Campus Background with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/campus-background.jpg"
            alt="Anurag University Campus"
            className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050A18]/80 via-[#050A18]/60 to-[#050A18]" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-blue-900/10" />
        </div>

        {/* Decorative Light Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto py-20 px-4">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/anurag-logo.png"
                alt="Anurag University Logo"
                className="w-48 md:w-56 h-auto relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-8 relative inline-block">
            <div className="absolute -left-12 -top-4 md:-left-20 md:-top-8 w-10 md:w-16 h-10 md:h-16 opacity-40 animate-float">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500">
                <path d="M12 3L4 9V21L12 18L20 21V9L12 3Z" />
              </svg>
            </div>

            <span className="block text-red-500 font-bold tracking-[0.2em] text-xs md:text-sm mb-4 uppercase animate-fade-in-down">
              AI Powered Campus Platform
            </span>

            <div className="flex items-center justify-center gap-4 md:gap-8 mb-2">
              {/* Simplified Laurel Left */}
              <div className="hidden md:block w-24 h-[1px] bg-gradient-to-l from-red-500 to-transparent relative">
                <div className="absolute right-0 -top-4 text-red-500/40 text-4xl">«</div>
              </div>

              <h1 className="text-6xl md:text-9xl font-serif font-bold tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] leading-none animate-title-reveal">
                Campus Genie
              </h1>

              {/* Simplified Laurel Right */}
              <div className="hidden md:block w-24 h-[1px] bg-gradient-to-r from-red-500 to-transparent relative">
                <div className="absolute left-0 -top-4 text-red-500/40 text-4xl">»</div>
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-3xl font-medium text-slate-200 mb-6 max-w-3xl mx-auto leading-tight animate-fade-in-up">
            The AI-powered operating system for Anurag University
          </h2>

          <p className="text-base md:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            One platform for AI academic support, infrastructure complaints, and hackathon team discovery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-10 py-7 text-xl shadow-[0_0_30px_rgba(185,28,28,0.4)] transition-all duration-300 ease-out hover:scale-105 rounded-full border border-red-500 group overflow-hidden relative"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in-up delay-500">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-red-500/50 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors" />

                  <div className={`w-14 h-14 rounded-full bg-slate-900/50 border border-white/10 flex items-center justify-center mb-6 shadow-xl group-hover:border-red-500/50 transition-colors`}>
                    <Icon className="w-6 h-6 text-red-500" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Bar/Links */}
      <section className="py-12 border-t border-white/5 bg-[#030712]">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-widest"><Sparkles className="w-4 h-4 text-red-500" /> GROQ AI</span>
          <span className="flex items-center gap-2 text-sm font-semibold tracking-widest"><Sparkles className="w-4 h-4 text-blue-500" /> SECURE AUTH</span>
          <span className="flex items-center gap-2 text-sm font-semibold tracking-widest"><Sparkles className="w-4 h-4 text-red-500" /> ANURAG UNIVERSITY</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] py-10 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs md:text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <img src="/anurag-logo.png" alt="Anurag Logo" className="w-24 h-auto opacity-50" />
            <div className="h-4 w-[1px] bg-slate-800" />
            <p>Campus Genie - AI Operating System</p>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-red-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-red-400 transition-colors">Terms of Service</Link>
          </div>
          <p className="text-slate-600">© 2024 Anurag University | Hackathon Project</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s infinite ease-in-out;
        }
        @keyframes title-reveal {
          from { opacity: 0; transform: translateY(20px); letter-spacing: -0.05em; }
          to { opacity: 1; transform: translateY(0); letter-spacing: -0.02em; }
        }
        .animate-title-reveal {
          animation: title-reveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}
