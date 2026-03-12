'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, CheckCircle, Circle, Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ManageEventPage() {
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(null)
  const [activeTab, setActiveTab] = useState('students')
  const [user, setUser] = useState(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchEvent()
        await fetchRSVPs()
        await fetchAttendance()
      }
      setLoading(false)
    }
    init()
  }, [params.id])

  const fetchEvent = async () => {
    const { data } = await supabase
      .from('events')
      .select(`*, categories(name)`)
      .eq('id', params.id)
      .single()
    setEvent(data)
  }

  const fetchRSVPs = async () => {
    const { data } = await supabase
      .from('rsvps')
      .select(`
        *,
        profiles(id, full_name, email, avatar_url)
      `)
      .eq('event_id', params.id)
      .order('registered_at', { ascending: true })
    setRsvps(data || [])
  }

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('student_id')
      .eq('event_id', params.id)
    setAttendance(data?.map(a => a.student_id) || [])
  }

  const toggleAttendance = async (studentId, isPresent) => {
    setAttendanceLoading(studentId)

    if (isPresent) {
      await supabase
        .from('attendance')
        .delete()
        .eq('event_id', params.id)
        .eq('student_id', studentId)
      setAttendance(prev => prev.filter(id => id !== studentId))
    } else {
      await supabase
        .from('attendance')
        .insert({
          event_id: params.id,
          student_id: studentId,
          marked_by: user.id,
        })
      setAttendance(prev => [...prev, studentId])
    }

    setAttendanceLoading(null)
  }

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600' },
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
    ongoing: { label: 'Ongoing', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-stone-100 text-stone-500' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-8 shimmer rounded-xl w-1/3" />
          <div className="h-40 shimmer rounded-2xl" />
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-stone-500">Event not found.</p>
          <Link href="/organiser/events" className="text-stone-900 font-medium underline mt-2 block">
            Back to events
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const status = statusConfig[event.status] || statusConfig.draft
  const attendanceCount = attendance.length

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Back button */}
        <Link
          href="/organiser/events"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to My Events
        </Link>

        {/* Event header card */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {event.image_url && (
            <div className="h-48 overflow-hidden">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  {event.categories?.name && (
                    <span className="text-xs text-stone-500">{event.categories.name}</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-stone-500 text-sm mt-2 leading-relaxed">{event.description}</p>
                )}
              </div>
            </div>

            {/* Event details */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <Calendar size={15} className="text-stone-400" />
                {format(new Date(event.date), 'EEE, MMM d yyyy')}
              </div>
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <Clock size={15} className="text-stone-400" />
                {format(new Date(event.date), 'h:mm a')}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <MapPin size={15} className="text-stone-400" />
                  {event.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <Users size={15} className="text-stone-400" />
                {rsvps.length} registered
                {event.capacity && ` / ${event.capacity} capacity`}
              </div>
            </div>

            {event.status === 'rejected' && event.rejection_reason && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <strong>Rejected:</strong> {event.rejection_reason}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{rsvps.length}</p>
            <p className="text-stone-500 text-xs mt-1">Registered</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{attendanceCount}</p>
            <p className="text-stone-500 text-xs mt-1">Attended</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">
              {rsvps.length > 0 ? Math.round((attendanceCount / rsvps.length) * 100) : 0}%
            </p>
            <p className="text-stone-500 text-xs mt-1">Attendance Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Registered Students ({rsvps.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'attendance'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Mark Attendance
          </button>
        </div>

        {/* Students list */}
        {rsvps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-stone-400" />
            </div>
            <p className="text-stone-900 font-semibold">No students registered yet</p>
            <p className="text-stone-500 text-sm mt-1">Students who RSVP will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="p-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">
                {activeTab === 'students' ? 'Registered Students' : 'Mark Attendance'}
              </h2>
              {activeTab === 'attendance' && (
                <p className="text-stone-500 text-xs mt-0.5">
                  Click the circle next to a student's name to mark them as present
                </p>
              )}
            </div>
            <div className="divide-y divide-stone-50">
              {rsvps.map(rsvp => {
                const student = rsvp.profiles
                const isPresent = attendance.includes(student?.id)

                return (
                  <div key={rsvp.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors">

                    {/* Avatar */}
                    {student?.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={student.full_name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-stone-500 text-sm font-semibold">
                          {student?.full_name?.[0] || '?'}
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 text-sm truncate">
                        {student?.full_name || 'Unknown'}
                      </p>
                      <p className="text-stone-500 text-xs truncate">{student?.email}</p>
                    </div>

                    {/* Attendance tab — toggle button */}
                    {activeTab === 'attendance' && (
                      <button
                        onClick={() => toggleAttendance(student.id, isPresent)}
                        disabled={attendanceLoading === student.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {isPresent ? (
                          <><CheckCircle size={13} /> Present</>
                        ) : (
                          <><Circle size={13} /> Absent</>
                        )}
                      </button>
                    )}

                    {/* Students tab — just show attendance status */}
                    {activeTab === 'students' && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {isPresent ? 'Attended' : 'Registered'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}