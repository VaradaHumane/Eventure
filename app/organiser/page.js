'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { Plus, Calendar, Users, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function OrganiserEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchEvents(user.id)
    }
    init()
  }, [])

  const fetchEvents = async (userId) => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select(`*, categories(name), rsvps(count)`)
      .eq('organiser_id', userId)
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event? This cannot be undone.')
    if (!confirmed) return

    setDeleteLoading(eventId)

    // Delete related records first
    await supabase.from('attendance').delete().eq('event_id', eventId)
    await supabase.from('rsvps').delete().eq('event_id', eventId)

    const { error } = await supabase.from('events').delete().eq('id', eventId)

    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      setEvents(prev => prev.filter(e => e.id !== eventId))
    }

    setDeleteLoading(null)
  }

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600' },
    pending_approval: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
    ongoing: { label: 'Ongoing', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-stone-100 text-stone-500' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
              My Events
            </h1>
            <p className="text-stone-500 mt-1">Manage and track all your events</p>
          </div>
          <Link
            href="/organiser/create"
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors"
          >
            <Plus size={16} />
            New Event
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4">
                <div className="w-14 h-14 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 shimmer rounded-lg w-1/2" />
                  <div className="h-4 shimmer rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-stone-400" />
            </div>
            <h3 className="text-stone-900 font-semibold text-lg mb-2">No events yet</h3>
            <p className="text-stone-500 text-sm mb-6">Create your first event to get started</p>
            <Link
              href="/organiser/create"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors"
            >
              <Plus size={15} />
              Create Event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => {
              const status = statusConfig[event.status] || statusConfig.draft
              const rsvpCount = event.rsvps?.[0]?.count || 0

              return (
                <div key={event.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4 hover:border-stone-200 hover:shadow-sm transition-all">

                  <div className="w-14 h-14 bg-stone-900 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-xs font-bold">
                      {format(new Date(event.date), 'MMM')}
                    </span>
                    <span className="text-white text-xl font-bold leading-none">
                      {format(new Date(event.date), 'd')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-stone-900 truncate">{event.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-stone-500 text-xs">
                      <span>{event.categories?.name || 'No category'}</span>
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {rsvpCount} registered
                      </span>
                      {event.location && <span>{event.location}</span>}
                    </div>
                    {event.status === 'rejected' && event.rejection_reason && (
                      <p className="text-red-500 text-xs mt-1">
                        Rejected: {event.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/organiser/events/${event.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors font-medium"
                    >
                      <Eye size={14} />
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteLoading === event.id}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete event"
                    >
                      {deleteLoading === event.id ? (
                        <div className="w-4 h-4 border-2 border-stone-300 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
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