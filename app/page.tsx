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
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-400/5 rounded-full blur-[160px]" />
        </div>

        {/* Dynamic Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.02)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(37,99,235,0.02)_1.5px,transparent_1.5px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 text-blue-700 text-sm font-semibold shadow-xl shadow-blue-500/5 animate-fade-in transition-all hover:bg-white/60 cursor-default group">
            <Sparkles className="w-4 h-4 text-blue-500 group-hover:rotate-12 transition-transform" />
            <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">AI-Powered Campus OS</span>
          </div>

          {/* Main Title Area */}
          <div className="relative group">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-colors" />
            <img
              src="/anurag-logo.png"
              alt="Anurag Logo"
              className="w-24 h-24 mx-auto object-contain mb-8 drop-shadow-2xl transition-transform hover:scale-110 duration-500"
            />

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[1.1]">
              Campus <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 bg-clip-text text-transparent">Genie</span>
            </h1>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-slate-200" />
              <p className="text-lg md:text-xl text-slate-500 font-medium tracking-wide uppercase">Anurag University</p>
              <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-slate-200" />
            </div>
          </div>

          {/* Value Prop */}
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 leading-tight">
              The intelligent backbone for modern student life.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-normal">
              Empowering students with <span className="text-blue-600 font-medium">real-time AI support</span>,
              streamlined <span className="text-red-500 font-medium">complaint tracking</span>, and
              collaborative <span className="text-indigo-600 font-medium">hackathon team bonding</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="relative overflow-hidden group bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-7 text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Tech stack badges */}
          <div className="pt-12 flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold tracking-widest uppercase text-slate-600">LLaMA 3.3 Power</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500 shadow-xl" />
              <span className="text-sm font-bold tracking-widest uppercase text-slate-600">Secure Vault</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500 fill-blue-50" />
              <span className="text-sm font-bold tracking-widest uppercase text-slate-600">2000+ Students</span>
            </div>
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
