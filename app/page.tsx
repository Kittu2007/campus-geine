'use client'

import { useState, useEffect } from 'react'
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
    title: 'Campus Buddy (FAQ bot)',
    description: 'Get instant answers to campus FAQs powered by Groq LLaMA 3.3.',
    color: 'from-[#1E2B58] to-[#2A3B73]',
  },
  {
    icon: AlertTriangle,
    title: 'Infrastructure Complaints',
    description: 'Report broken equipment with photo evidence. Track resolution in real-time.',
    color: 'from-[#C62026] to-red-800',
  },
  {
    icon: Users,
    title: 'Hackathon Team Connect',
    description: 'Post team requirements and find teammates with complementary skills.',
    color: 'from-slate-700 to-slate-900',
  },
]

// Custom Logo Animation Component
function AnimatedLogo() {
  const [isInterlocked, setIsInterlocked] = useState(false)

  useEffect(() => {
    // Trigger the interlocking animation 300ms after mount
    const timer = setTimeout(() => setIsInterlocked(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
      {/* Background Container for Context */}
      <div className="absolute inset-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl" />

      {/* Blue Shape (Left/Bottom) */}
      <div
        className={`absolute w-12 h-20 bg-[#1E2B58] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${isInterlocked ? 'translate-x-[-12px] translate-y-[8px] rotate-0' : 'translate-x-[-40px] translate-y-[20px] -rotate-45 opacity-0'
          }`}
        style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 40%, 0% 0%)' }}
      />

      {/* Red Shape (Right/Top) */}
      <div
        className={`absolute w-12 h-20 bg-[#C62026] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) delay-100 ${isInterlocked ? 'translate-x-[12px] translate-y-[-8px] rotate-0' : 'translate-x-[40px] translate-y-[-20px] rotate-45 opacity-0'
          }`}
        style={{ clipPath: 'polygon(0% 100%, 100% 60%, 100% 0%, 0% 0%)' }}
      />

      {/* Final Logo Fade-In (Overrides shapes once settled) */}
      <img
        src="/anurag-logo.png"
        alt="Anurag Logo"
        className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 delay-700 ${isInterlocked ? 'opacity-100' : 'opacity-0'
          }`}
      />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800 flex flex-col justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1E2B58]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C62026]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,43,88,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,43,88,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mt-12 animate-slide-in">

          <AnimatedLogo />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#1E2B58] text-white text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C62026]" />
            AI-Powered Campus System
          </div>

          <div className="mb-6 relative">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1E2B58]">
              Campus Genie
            </h1>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-[#C62026]" />
          </div>

          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto mt-10 font-medium tracking-tight">
            The structural, intelligent operating system for Anurag University
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-[#1E2B58] hover:bg-[#151f42] text-white font-semibold px-10 py-6 text-lg rounded-sm shadow-[0_4px_14px_0_rgba(30,43,88,0.39)] transition-all duration-200 ease-in-out hover:shadow-[0_6px_20px_rgba(30,43,88,0.23)] hover:animate-pulse-interlock"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C62026]" />
              Fast Groq AI
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1E2B58]" />
              Secure Architecture
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E2B58] mb-4 tracking-tight">
              Everything Campus, One Platform
            </h2>
            <div className="w-12 h-1 bg-[#C62026] mx-auto mb-4" />
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
                  className="group relative p-8 rounded-sm bg-white border-[1.5px] border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                >
                  <div className={`w-14 h-14 rounded-sm bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E2B58] mb-3">{feature.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 sm:p-16 rounded-sm bg-[#1E2B58] border border-[#2A3B73] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight relative z-10">
              Ready to upgrade your campus experience?
            </h2>
            <p className="text-blue-100 mb-8 text-lg relative z-10 max-w-2xl mx-auto font-medium tracking-tight">
              Sign in with your university email and start using Campus Genie in seconds.
            </p>
            <Link href="/login" className="relative z-10">
              <Button
                size="lg"
                className="bg-[#C62026] hover:bg-red-700 text-white shadow-md font-semibold px-8 py-6 text-lg transition-all duration-200 ease-in-out rounded-sm hover:animate-pulse-interlock"
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
            <span className="text-[#1E2B58] font-bold">Campus Genie</span> — Anurag University
          </div>
          <p>Built with precision for the campus community</p>
        </div>
      </footer>
    </div>
  )
}
