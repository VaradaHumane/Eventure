'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Calendar, Users, Star } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        const roleMap = {
          admin: '/admin',
          organiser: '/organiser',
          student: '/student'
        }
        router.push(roleMap[profile?.role] || '/student')
      }
    }
    checkUser()
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const features = [
    { icon: Calendar, label: 'Discover Events', desc: 'Browse all campus happenings' },
    { icon: Users, label: 'RSVP Instantly', desc: 'Reserve your spot in one click' },
    { icon: Star, label: 'Track Your Schedule', desc: 'See upcoming events at a glance' },
  ]

  return (
    <div className="min-h-screen bg-stone-50 flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">

        {/* Background dot pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Glow blob */}
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-400 rounded-full opacity-10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-stone-900" fill="currentColor" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">eventure</span>
        </div>

        {/* Main copy */}
        <div className="relative space-y-6">
          <h1
            className="text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            Your campus,<br />
            <span className="text-amber-400">always happening.</span>
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed max-w-sm">
            One place to discover events, connect with organisers, and never miss what matters.
          </p>

          <div className="space-y-4 pt-2">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-stone-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-stone-600 text-xs">
          © 2025 Eventure. All rights reserved.
        </p>
      </div>

      {/* Right panel — sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">

          {/* Mobile logo (only shows on small screens) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-amber-400" fill="currentColor" />
            </div>
            <span className="font-bold text-xl">eventure</span>
          </div>

          <div className="space-y-2">
            <h2
              className="text-3xl font-bold text-stone-900"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              Welcome back
            </h2>
            <p className="text-stone-500 text-sm">
              Sign in with your campus Google account to continue.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Google sign in button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-stone-400 text-stone-800 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="text-xs text-stone-400 text-center leading-relaxed">
            By signing in, you agree to our terms. Your role is assigned automatically based on your account.
          </p>

          {/* Role info cards */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-emerald-700 text-xs font-semibold">Student</p>
              <p className="text-emerald-500 text-xs mt-0.5">Browse & RSVP</p>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
              <p className="text-violet-700 text-xs font-semibold">Organiser</p>
              <p className="text-violet-500 text-xs mt-0.5">Create events</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <p className="text-amber-700 text-xs font-semibold">Admin</p>
              <p className="text-amber-500 text-xs mt-0.5">Full control</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}