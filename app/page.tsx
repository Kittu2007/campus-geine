import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  MessageCircle,
  AlertTriangle,
  BookOpen,
  Users,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'Campus Buddy AI',
    description: 'Get instant answers to campus FAQs powered by RAG and Groq LLaMA 3.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: AlertTriangle,
    title: 'Infrastructure Complaints',
    description: 'Report broken equipment with photo evidence. Track resolution in real-time.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BookOpen,
    title: 'Resources Hub',
    description: 'Browse subject-wise PDFs, videos, and AI prompts uploaded by faculty.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Hackathon Team Connect',
    description: 'Post team requirements and find teammates with complementary skills.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: User,
    title: 'Student Profile',
    description: 'Showcase GitHub, LeetCode, LinkedIn — your campus portfolio in one link.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Domain-restricted auth ensures only verified university members can access.',
    color: 'from-slate-500 to-slate-600',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Campus Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Campus</span>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"> OS</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-4 max-w-2xl mx-auto">
            The Unified Operating System for Campus Life
          </p>

          <p className="text-base text-slate-500 mb-10 max-w-xl mx-auto">
            One platform for AI-powered academic support, infrastructure complaints,
            study resources, hackathon team discovery, and student profiles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Groq AI
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Secure Auth
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              Anurag University
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything Campus, One Platform
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Six integrated modules that replace 10+ disconnected tools students use daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to upgrade your campus experience?
            </h2>
            <p className="text-slate-400 mb-8">
              Sign in with your university email and start using Campus OS in seconds.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
              >
                Sign In Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Campus OS — Anurag University
          </div>
          <p>Built with ❤️ for the campus community</p>
        </div>
      </footer>
    </div>
  )
}
