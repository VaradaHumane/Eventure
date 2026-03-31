'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EventCard from '@/components/events/EventCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function StudentDashboard() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [registerLoading, setRegisterLoading] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        const { data: regData } = await supabase
          .from('rsvps')
          .select('event_id')
          .eq('student_id', user.id)
        setRegistrations(regData?.map(r => r.event_id) || [])
      }

      await fetchEvents()
    }
    init()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select(`*, categories (id, name, color)`)
      .in('status', ['published', 'ongoing', 'completed'])
      .order('date', { ascending: true })
    if (!error) setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  const handleRegister = async (eventId, isRegistered) => {
    if (!user) return
    setRegisterLoading(eventId)

    if (isRegistered) {
      await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('student_id', user.id)
      setRegistrations(prev => prev.filter(id => id !== eventId))
    } else {
      await supabase
        .from('rsvps')
        .insert({ event_id: eventId, student_id: user.id })
      setRegistrations(prev => [...prev, eventId])
    }

    setRegisterLoading(null)
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' ||
      event.categories?.name === selectedCategory
    const matchesDate = !selectedDate ||
      new Date(event.date).toDateString() === new Date(selectedDate).toDateString()
    return matchesSearch && matchesCategory && matchesDate
  })

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSelectedDate('')
  }

  const hasFilters = search || selectedCategory !== 'all' || selectedDate

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
            Discover Events
          </h1>
          <p className="text-stone-500 mt-1">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}!` : 'Welcome!'} Find something exciting happening on campus.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-stone-500">
              <SlidersHorizontal size={15} />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        <p className="text-stone-500 text-sm">
          {loading ? 'Loading...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="h-44 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 shimmer rounded-lg w-1/3" />
                  <div className="h-5 shimmer rounded-lg w-3/4" />
                  <div className="h-4 shimmer rounded-lg w-1/2" />
                  <div className="h-10 shimmer rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-stone-400" />
            </div>
            <h3 className="text-stone-900 font-semibold text-lg mb-2">No events found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-sm text-stone-900 font-medium underline underline-offset-2">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
                isRegistered={registrations.includes(event.id)}
                registerLoading={registerLoading === event.id}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}