import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Zap, ArrowRight, Calendar, Users, Shield } from 'lucide-react'

export default function HomePage() {
  const stats = [
    { value: '200+', label: 'Events per semester' },
    { value: '5k+', label: 'Students connected' },
    { value: '50+', label: 'Active organisers' },
  ]

  const features = [
    {
      icon: Calendar,
      title: 'Discover Everything',
      desc: 'Browse events by category, date, or organiser. Never miss a workshop, cultural fest, or sports meet again.',
      color: 'amber',
    },
    {
      icon: Users,
      title: 'Organise with Ease',
      desc: 'Create events, upload banners, manage RSVPs, and mark attendance — all from one clean dashboard.',
      color: 'violet',
    },
    {
      icon: Shield,
      title: 'Admin Oversight',
      desc: 'Approve events before they go live, assign organisers, and maintain full control over the campus calendar.',
      color: 'emerald',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen">

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900">

          {/* Dot grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #d6d3d1 1px, transparent 0)`,
              backgroundSize: '28px 28px'
            }}
          />

          {/* Glow blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500 rounded-full opacity-10 blur-3xl" />

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-stone-800 border border-stone-700 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-up">
              <Zap size={12} fill="currentColor" />
              Campus Event Hub
            </div>

            {/* Headline */}
            <h1
              className="text-6xl md:text-8xl font-bold text-white leading-tight mb-6 animate-fade-up animate-delay-100"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              Your campus,<br />
              <span className="text-amber-400">always happening.</span>
            </h1>

            {/* Subheading */}
            <p className="text-stone-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200">
              Discover events, RSVP instantly, and stay connected to everything happening around you.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
              <Link
                href="/login"
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg group text-sm"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="text-stone-400 hover:text-white text-sm font-medium transition-colors"
              >
                Learn more ↓
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 animate-fade-up animate-delay-400">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-white">{value}</p>
                  <p className="text-stone-500 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 bg-stone-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold text-stone-900 mb-4"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                Built for everyone on campus
              </h2>
              <p className="text-stone-500 text-lg max-w-xl mx-auto">
                Whether you're attending, organising, or managing — Eventure has a role for you.
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

        {/* Bottom CTA Section */}
        <section className="py-24 px-4 bg-stone-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-4xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              Ready to dive in?
            </h2>
            <p className="text-stone-400 mb-8 text-lg">
              Sign in with your Google account and start exploring events today.
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
            <p className="text-stone-600 text-xs">© 2025 Eventure. All rights reserved.</p>
          </div>
        </footer>

      </main>
    </>
  )
}