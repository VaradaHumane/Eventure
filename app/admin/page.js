'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { Users, Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    publishedEvents: 0,
  })
  const [pendingEvents, setPendingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [approveLoading, setApproveLoading] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    // Fetch stats
    const [usersRes, eventsRes, pendingRes, publishedRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('events').select('id', { count: 'exact' }),
      supabase.from('events').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
      supabase.from('events').select('id', { count: 'exact' }).in('status', ['published', 'ongoing']),
    ])

    setStats({
      totalUsers: usersRes.count || 0,
      totalEvents: eventsRes.count || 0,
      pendingEvents: pendingRes.count || 0,
      publishedEvents: publishedRes.count || 0,
    })

    // Fetch pending events
    const { data: pending } = await supabase
      .from('events')
      .select(`*, categories(name), profiles(full_name, email)`)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true })

    setPendingEvents(pending || [])
    setLoading(false)
  }

  const handleApprove = async (eventId) => {
    setApproveLoading(eventId + '_approve')
    await supabase
      .from('events')
      .update({ status: 'published' })
      .eq('id', eventId)
    await fetchData()
    setApproveLoading(null)
  }

  const handleReject = async (eventId) => {
    const reason = window.prompt('Enter rejection reason (optional):')
    if (reason === null) return // user clicked cancel

    setApproveLoading(eventId + '_reject')
    await supabase
      .from('events')
      .update({ status: 'rejected', rejection_reason: reason || 'Did not meet requirements' })
      .eq('id', eventId)
    await fetchData()
    setApproveLoading(null)
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approval', value: stats.pendingEvents, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Live Events', value: stats.publishedEvents, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
            Admin Dashboard
          </h1>
          <p className="text-stone-500 mt-1">Full oversight of Eventure — users, events and approvals.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-stone-900">{loading ? '—' : value}</p>
              <p className="text-stone-500 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/admin/events"
            className="bg-stone-900 text-white rounded-2xl p-6 hover:bg-stone-800 transition-colors group"
          >
            <Calendar size={24} className="mb-3 text-amber-400" />
            <h3 className="font-bold text-lg">Manage Events</h3>
            <p className="text-stone-400 text-sm mt-1">Approve, reject and view all events</p>
          </Link>
          <Link
            href="/admin/users"
            className="bg-white border border-stone-100 rounded-2xl p-6 hover:border-stone-200 hover:shadow-md transition-all group"
          >
            <Users size={24} className="mb-3 text-violet-500" />
            <h3 className="font-bold text-lg text-stone-900">Manage Users</h3>
            <p className="text-stone-500 text-sm mt-1">Promote students to organisers</p>
          </Link>
        </div>

        {/* Pending approvals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900">
              Pending Approvals
              {stats.pendingEvents > 0 && (
                <span className="ml-2 text-sm font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {stats.pendingEvents}
                </span>
              )}
            </h2>
            <Link href="/admin/events" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
              View all events →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4">
                  <div className="w-14 h-14 shimmer rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 shimmer rounded-lg w-1/2" />
                    <div className="h-4 shimmer rounded-lg w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-stone-900 font-semibold">All caught up!</p>
              <p className="text-stone-500 text-sm mt-1">No events waiting for approval</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map(event => (
                <div key={event.id} className="bg-white rounded-2xl border border-amber-100 p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-stone-900 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-xs font-bold">
                      {format(new Date(event.date), 'MMM')}
                    </span>
                    <span className="text-white text-xl font-bold leading-none">
                      {format(new Date(event.date), 'd')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate">{event.title}</h3>
                    <p className="text-stone-500 text-xs mt-0.5">
                      By {event.profiles?.full_name || event.profiles?.email} · {event.categories?.name || 'No category'}
                    </p>
                    {event.location && (
                      <p className="text-stone-400 text-xs">{event.location}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(event.id)}
                      disabled={approveLoading === event.id + '_approve'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={13} />
                      {approveLoading === event.id + '_approve' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      disabled={approveLoading === event.id + '_reject'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      {approveLoading === event.id + '_reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}