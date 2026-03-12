'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Calendar, MapPin, Clock, X } from 'lucide-react'
import { format, isPast, isFuture } from 'date-fns'

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(null)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('upcoming')
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchRegistrations(user.id)
    }
    init()
  }, [])

  const fetchRegistrations = async (userId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rsvps')
      .select(`*, events (*, categories (name, color))`)
      .eq('student_id', userId)
      .order('registered_at', { ascending: false })
    if (!error) setRegistrations(data || [])
    setLoading(false)
  }

  const handleCancel = async (registrationId) => {
    setCancelLoading(registrationId)
    await supabase.from('rsvps').delete().eq('id', registrationId)
    setRegistrations(prev => prev.filter(r => r.id !== registrationId))
    setCancelLoading(null)
  }

  const upcomingRegistrations = registrations.filter(r =>
    r.events && isFuture(new Date(r.events.date)) && r.events.status !== 'completed'
  )
  const pastRegistrations = registrations.filter(r =>
    r.events && (isPast(new Date(r.events.date)) || r.events.status === 'completed')
  )

  const displayedRegistrations = activeTab === 'upcoming' ? upcomingRegistrations : pastRegistrations

  const categoryColors = {
    Technical: 'bg-indigo-100 text-indigo-700',
    Cultural: 'bg-amber-100 text-amber-700',
    Sports: 'bg-emerald-100 text-emerald-700',
    Workshop: 'bg-blue-100 text-blue-700',
    Social: 'bg-pink-100 text-pink-700',
    Academic: 'bg-violet-100 text-violet-700',
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
            My Events
          </h1>
          <p className="text-stone-500 mt-1">Events you have registered for</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-3xl font-bold text-stone-900">{registrations.length}</p>
            <p className="text-stone-500 text-sm mt-1">Total Registered</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-3xl font-bold text-emerald-600">{upcomingRegistrations.length}</p>
            <p className="text-stone-500 text-sm mt-1">Upcoming</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-3xl font-bold text-stone-400">{pastRegistrations.length}</p>
            <p className="text-stone-500 text-sm mt-1">Attended</p>
          </div>
        </div>

        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upcoming' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Upcoming ({upcomingRegistrations.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'past' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Past ({pastRegistrations.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4">
                <div className="w-16 h-16 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 shimmer rounded-lg w-1/2" />
                  <div className="h-4 shimmer rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-stone-400" />
            </div>
            <h3 className="text-stone-900 font-semibold text-lg mb-2">
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            </h3>
            <p className="text-stone-500 text-sm">
              {activeTab === 'upcoming' ? 'Head to Discover to find events to register for!' : 'Events you attend will show up here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedRegistrations.map(registration => {
              const event = registration.events
              if (!event) return null
              const categoryName = event.categories?.name || 'General'
              const colorClass = categoryColors[categoryName] || 'bg-stone-100 text-stone-600'

              return (
                <div key={registration.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 hover:border-stone-200 hover:shadow-sm transition-all">
                  <div className="w-16 h-16 bg-stone-900 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-xs font-bold uppercase">
                      {format(new Date(event.date), 'MMM')}
                    </span>
                    <span className="text-white text-2xl font-bold leading-none">
                      {format(new Date(event.date), 'd')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
                          {categoryName}
                        </span>
                        <h3 className="font-bold text-stone-900 mt-1 truncate">{event.title}</h3>
                      </div>
                      {activeTab === 'upcoming' && event.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(registration.id)}
                          disabled={cancelLoading === registration.id}
                          className="flex-shrink-0 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel Registration"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                        <Clock size={12} />
                        {format(new Date(event.date), 'h:mm a')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                          <MapPin size={12} />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}