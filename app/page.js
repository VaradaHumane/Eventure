import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Zap, ArrowRight, Calendar, Users, Shield, Search, CheckCircle, ClipboardList } from 'lucide-react'

export default function HomePage() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Browse Events',
      desc: 'Sign in with your college Google account and explore all upcoming campus events — filter by category, date or keyword.',
    },
    {
      number: '02',
      icon: CheckCircle,
      title: 'Register Instantly',
      desc: 'Found something interesting? Register with one click and it shows up in your personal events list.',
    },
    {
      number: '03',
      icon: ClipboardList,
      title: 'Attend & Get Marked',
      desc: 'Show up to the event and the organiser marks your attendance — all tracked automatically in the system.',
    },
  ]

  const features = [
    {
      icon: Calendar,
      title: 'For Students',
      desc: 'Discover and register for technical, cultural, sports and academic events happening across campus.',
      color: 'amber',
    },
    {
      icon: Users,
      title: 'For Organisers',
      desc: 'Create and manage events, track registrations, and mark attendance — all from one dashboard.',
      color: 'violet',
    },
    {
      icon: Shield,
      title: 'For Admins',
      desc: 'Review and approve events before they go live, manage user roles, and maintain full oversight.',
      color: 'emerald',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen">

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #d6d3d1 1px, transparent 0)`,
              backgroundSize: '28px 28px'
            }}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500 rounded-full opacity-10 blur-3xl" />

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

            <div className="inline-flex items-center gap-2 bg-stone-800 border border-stone-700 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-up">
              <Zap size={12} fill="currentColor" />
              Campus Event Management System
            </div>

            <h1
              className="text-6xl md:text-8xl font-bold text-white leading-tight mb-6 animate-fade-up animate-delay-100"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              Everything happening on campus<br />
              <span className="text-amber-400">all in one place.</span>
            </h1>

            <p className="text-stone-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200">
              Plan, manage, and explore campus events effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
              <Link
                href="/login"
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg group text-sm"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="text-stone-400 hover:text-white text-sm font-medium transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold text-stone-900 mb-4"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                How it works
              </h2>
              <p className="text-stone-500 text-lg max-w-xl mx-auto">
                From sign-in to attendance, the entire event lifecycle in three simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map(({ number, icon: Icon, title, desc }) => (
                <div key={number} className="relative">
                  {/* Connector line */}
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-stone-100 -z-10" />

                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center">
                        <Icon size={24} className="text-amber-400" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center">
                        {number.replace('0', '')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-3">{title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles section */}
        <section className="py-24 px-4 bg-stone-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold text-stone-900 mb-4"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                Built for everyone on campus
              </h2>
              <p className="text-stone-500 text-lg max-w-xl mx-auto">
                Three distinct roles: each with their own dashboard and permissions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl p-8 border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className={`text-${color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-3">{title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-stone-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              Ready to get started?
            </h2>
            <p className="text-stone-400 mb-8 text-lg">
              Sign in with your college Google account to access your dashboard.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 group"
            >
              Sign in with Google
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-stone-900 border-t border-stone-800 py-8 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center">
                <Zap size={12} className="text-stone-900" fill="currentColor" />
              </div>
              <span className="text-stone-400 text-sm font-semibold">eventure</span>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}