'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CheckCircle, XCircle, Calendar, Users, Search, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select(`*, categories(name), profiles(full_name, email, avatar_url), rsvps(count)`)
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  const handleApprove = async (eventId) => {
    setActionLoading(eventId + '_approve')
    await supabase.from('events').update({ status: 'published' }).eq('id', eventId)
    await fetchEvents()
    setActionLoading(null)
  }

  const handleReject = async (eventId) => {
    const reason = window.prompt('Enter rejection reason (optional):')
    if (reason === null) return
    setActionLoading(eventId + '_reject')
    await supabase
      .from('events')
      .update({ status: 'rejected', rejection_reason: reason || 'Did not meet requirements' })
      .eq('id', eventId)
    await fetchEvents()
    setActionLoading(null)
  }

  const handleStatusChange = async (eventId, newStatus) => {
    setActionLoading(eventId + '_status')
    await supabase.from('events').update({ status: newStatus }).eq('id', eventId)
    await fetchEvents()
    setActionLoading(null)
  }

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Permanently delete this event? This cannot be undone.')
    if (!confirmed) return

    setActionLoading(eventId + '_delete')

    // Delete related records first
    await supabase.from('attendance').delete().eq('event_id', eventId)
    await supabase.from('rsvps').delete().eq('event_id', eventId)

    const { error } = await supabase.from('events').delete().eq('id', eventId)

    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      setEvents(prev => prev.filter(e => e.id !== eventId))
    }

    setActionLoading(null)
  }

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600' },
    pending_approval: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
    ongoing: { label: 'Ongoing', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-stone-100 text-stone-500' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      event.profiles?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
            All Events
          </h1>
          <p className="text-stone-500 mt-1">Review, approve and manage every event on the platform</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by event or organiser..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="all">All Statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <p className="text-stone-500 text-sm">
          {loading ? 'Loading...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4">
                <div className="w-14 h-14 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 shimmer rounded-lg w-1/2" />
                  <div className="h-4 shimmer rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <Calendar size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No events found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map(event => {
              const status = statusConfig[event.status] || statusConfig.draft
              const rsvpCount = event.rsvps?.[0]?.count || 0

              return (
                <div key={event.id} className="bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">

                    <div className="w-14 h-14 bg-stone-900 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 text-xs font-bold">
                        {format(new Date(event.date), 'MMM')}
                      </span>
                      <span className="text-white text-xl font-bold leading-none">
                        {format(new Date(event.date), 'd')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-900">{event.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-stone-500 text-xs">
                        <span>By {event.profiles?.full_name || event.profiles?.email || 'Unknown'}</span>
                        <span>{event.categories?.name || 'No category'}</span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {rsvpCount} registered
                        </span>
                        {event.location && <span>{event.location}</span>}
                      </div>
                      {event.status === 'rejected' && event.rejection_reason && (
                        <p className="text-red-500 text-xs mt-1">Reason: {event.rejection_reason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {event.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(event.id)}
                            disabled={actionLoading === event.id + '_approve'}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={12} />
                            {actionLoading === event.id + '_approve' ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(event.id)}
                            disabled={actionLoading === event.id + '_reject'}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            {actionLoading === event.id + '_reject' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {event.status === 'published' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'ongoing')}
                          disabled={actionLoading === event.id + '_status'}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Mark Ongoing
                        </button>
                      )}
                      {event.status === 'ongoing' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'completed')}
                          disabled={actionLoading === event.id + '_status'}
                          className="px-3 py-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={actionLoading === event.id + '_delete'}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionLoading === event.id + '_delete' ? (
                          <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Delete
                      </button>
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