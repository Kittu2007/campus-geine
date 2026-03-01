import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  AlertTriangle,
  Users,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'Campus Buddy AI',
    description: 'Get instant answers to campus FAQs powered by Groq LLaMA 3.3.',
    color: 'from-blue-600 to-blue-700',
  },
  {
    icon: AlertTriangle,
    title: 'Infrastructure Complaints',
    description: 'Report broken equipment with photo evidence. Track resolution in real-time.',
    color: 'from-red-600 to-red-700',
  },
  {
    icon: Users,
    title: 'Hackathon Team Connect',
    description: 'Post team requirements and find teammates with complementary skills.',
    color: 'from-indigo-600 to-indigo-700',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Campus Background"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/90" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-600/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Top Logo */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/30 blur-xl rounded-full scale-150 animate-pulse" />
              <img src="/anurag-logo.png" alt="AU Logo" className="relative w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            </div>
          </div>

          {/* AI Badge */}
          <div className="mb-6 px-4 py-1 rounded-md border border-red-500/30 bg-red-900/20 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold text-red-500 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            AI-Powered Campus Platform
          </div>

          {/* Main Title with Laurel Wreaths */}
          <div className="relative flex items-center justify-center gap-4 md:gap-8 mb-6">
            <div className="hidden md:block w-24 h-24 text-red-600 opacity-60 rotate-180">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 21.6c-4.7 0-8.5-4-8.5-9 0-3.3 1.8-6.1 4.4-7.6-.4 1.1-.6 2.3-.6 3.6 0 4.1 3.4 7.5 7.5 7.5.9 0 1.8-.2 2.6-.5-1.5 3.1-4.1 6-5.4 6zm5.6-3c-.1-.6-.2-1.3-.2-2 0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.4-2.2-3.8-6.2-6.4-10.9-6.4-6.8 0-12.4 5.6-12.4 12.4s5.6 12.4 12.4 12.4c1.8 0 3.5-.4 5-1.1-.8.2-1.6.3-2.4.3z" /></svg>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-bold text-white tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
              Campus Genie
            </h1>
            <div className="hidden md:block w-24 h-24 text-red-600 opacity-60">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 21.6c-4.7 0-8.5-4-8.5-9 0-3.3 1.8-6.1 4.4-7.6-.4 1.1-.6 2.3-.6 3.6 0 4.1 3.4 7.5 7.5 7.5.9 0 1.8-.2 2.6-.5-1.5 3.1-4.1 6-5.4 6zm5.6-3c-.1-.6-.2-1.3-.2-2 0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.4-2.2-3.8-6.2-6.4-10.9-6.4-6.8 0-12.4 5.6-12.4 12.4s5.6 12.4 12.4 12.4c1.8 0 3.5-.4 5-1.1-.8.2-1.6.3-2.4.3z" /></svg>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-light text-slate-200 mb-4 drop-shadow-md">
            The AI-powered operating system for Anurag University
          </h2>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mb-12 drop-shadow-sm leading-relaxed">
            One platform for AI academic support, infrastructure complaints, and hackathon team discovery.
          </p>

          <Link href="/login" className="mb-20">
            <Button
              size="lg"
              className="bg-red-700 hover:bg-red-800 text-white font-bold px-12 py-7 text-xl rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(185,28,28,0.4)] border border-red-500/30"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          {/* Feature Grid Inverted Styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-auto">
            <div className="p-6 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/5 flex flex-col items-center text-center group hover:bg-slate-900/80 transition-all">
              <div className="w-12 h-12 mb-4 text-blue-500">
                <MessageCircle className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academic Support</h3>
              <p className="text-xs text-slate-400">Get instant AI-powered answers to every campus query.</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/5 flex flex-col items-center text-center group hover:bg-slate-900/80 transition-all">
              <div className="w-12 h-12 mb-4 text-red-500">
                <AlertTriangle className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Infrastructure Complaints</h3>
              <p className="text-xs text-slate-400">Report broken campus items and track resolution progress.</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/5 flex flex-col items-center text-center group hover:bg-slate-900/80 transition-all">
              <div className="w-12 h-12 mb-4 text-indigo-500">
                <Users className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hackathon Team Discovery</h3>
              <p className="text-xs text-slate-400">Find the perfect teammates for your next big project.</p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
            <div className="flex items-center gap-2 grayscale opacity-50"><Zap className="w-3 h-3" /> Groq AI</div>
            <div className="flex items-center gap-2 grayscale opacity-50"><Shield className="w-3 h-3" /> Firebase</div>
            <div className="flex items-center gap-2 grayscale opacity-50"><Sparkles className="w-3 h-3" /> Stitch Connect</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
              Everything Campus, One Platform
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Integrated modules that replace disconnected tools students use daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative p-8 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 sm:p-16 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 tracking-tight relative z-10">
              Ready to upgrade your campus experience?
            </h2>
            <p className="text-slate-600 mb-8 text-lg relative z-10 max-w-2xl mx-auto">
              Sign in with your university email and start using Campus Genie in seconds.
            </p>
            <Link href="/login" className="relative z-10">
              <Button
                size="lg"
                className="bg-white text-blue-700 border border-slate-200 shadow-sm hover:bg-slate-50 font-semibold px-8 py-6 text-lg transition-all duration-200 ease-in-out hover:scale-105 rounded-xl hover:shadow-md"
              >
                Sign In Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <img src="/anurag-logo.png" alt="AnuragLogo" className="w-5 h-5 object-contain" />
            Campus Genie — Anurag University
          </div>
          <p>Built with ❤️ for the campus community</p>
        </div>
      </footer>
    </div>
  )
}
