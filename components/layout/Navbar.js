'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, LogOut, User, Zap } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = {
    admin: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/events', label: 'Events' },
      { href: '/admin/users', label: 'Users' },
    ],
    organiser: [
      { href: '/organiser', label: 'Dashboard' },
      { href: '/organiser/events', label: 'My Events' },
      { href: '/organiser/create', label: 'Create Event' },
    ],
    student: [
  { href: '/student', label: 'Discover' },
  { href: '/student/my-events', label: 'My Events' },
  { href: '/student/profile', label: 'My Profile' },
],
  }

  const links = profile ? (navLinks[profile.role] || navLinks.student) : []

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href={profile ? `/${profile.role}` : '/'}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center group-hover:bg-stone-700 transition-colors">
              <Zap size={16} className="text-amber-400" fill="currentColor" />
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-900">
              eventure
            </span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role badge */}
                {profile && (
                  <span className={`hidden md:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
                    profile.role === 'admin'
                      ? 'bg-amber-100 text-amber-700'
                      : profile.role === 'organiser'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {profile.role}
                  </span>
                )}

                {/* Avatar */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-stone-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                    <User size={14} className="text-stone-500" />
                  </div>
                )}

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <LogOut size={15} />
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-1 text-stone-700"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && user && (
          <div className="md:hidden border-t border-stone-100 py-3 space-y-1 bg-white rounded-b-xl shadow-lg">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium mx-2 ${
                  pathname === link.href
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full mx-2"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}