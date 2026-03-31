'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, CheckCircle, Circle, Calendar, MapPin, Clock, X, Phone, Hash, BookOpen, User } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import PerformanceSubmissions from '@/components/events/PerformanceSubmissions'

export default function ManageEventPage() {
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(null)
  const [activeTab, setActiveTab] = useState('students')
  const [user, setUser] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchEvent()
        await fetchRegistrations()
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

  const fetchRegistrations = async () => {
    const { data } = await supabase
      .from('rsvps')
      .select(`*, profiles(id, full_name, email, avatar_url, phone, age, year_of_study, branch, roll_number, gender)`)
      .eq('event_id', params.id)
      .order('registered_at', { ascending: true })
    setRegistrations(data || [])
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
      await supabase.from('attendance').delete()
        .eq('event_id', params.id).eq('student_id', studentId)
      setAttendance(prev => prev.filter(id => id !== studentId))
    } else {
      await supabase.from('attendance').insert({
        event_id: params.id, student_id: studentId, marked_by: user.id,
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

        <Link href="/organiser/events"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">
          <ArrowLeft size={16} />Back to My Events
        </Link>

        {/* Event header */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {event.image_url && (
            <div className="h-48 overflow-hidden">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                {status.label}
              </span>
              {event.categories?.name && (
                <span className="text-xs text-stone-500">{event.categories.name}</span>
              )}
              {event.requires_performance_form && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  🎭 Performance Event
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
              {event.title}
            </h1>
            {event.description && (
              <p className="text-stone-500 text-sm mt-2 leading-relaxed">{event.description}</p>
            )}

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
                {registrations.length} students registered
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{registrations.length}</p>
            <p className="text-stone-500 text-xs mt-1">Registered</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{attendanceCount}</p>
            <p className="text-stone-500 text-xs mt-1">Attended</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">
              {registrations.length > 0 ? Math.round((attendanceCount / registrations.length) * 100) : 0}%
            </p>
            <p className="text-stone-500 text-xs mt-1">Attendance Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
          <button onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'students' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}>
            Registered Students ({registrations.length})
          </button>
          <button onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'attendance' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}>
            Mark Attendance
          </button>
          {event.requires_performance_form && (
            <button onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'performance' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}>
              🎭 Performances
            </button>
          )}
        </div>

        {/* Performance tab content */}
        {activeTab === 'performance' && event.requires_performance_form && (
          <PerformanceSubmissions eventId={params.id} />
        )}

        {/* Student list — only show when on students or attendance tab */}
        {(activeTab === 'students' || activeTab === 'attendance') && (
          <>
            {registrations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
                <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users size={22} className="text-stone-400" />
                </div>
                <p className="text-stone-900 font-semibold">No students registered yet</p>
                <p className="text-stone-500 text-sm mt-1">Students who register will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="p-4 border-b border-stone-100">
                  <h2 className="font-semibold text-stone-900">
                    {activeTab === 'students' ? 'Registered Students' : 'Mark Attendance'}
                  </h2>
                  <p className="text-stone-500 text-xs mt-0.5">
                    {activeTab === 'students'
                      ? 'Click on a student to view their full details'
                      : 'Click the button to toggle attendance'}
                  </p>
                </div>
                <div className="divide-y divide-stone-50">
                  {registrations.map(registration => {
                    const student = registration.profiles
                    const isPresent = attendance.includes(student?.id)

                    return (
                      <div
                        key={registration.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer"
                        onClick={() => activeTab === 'students' && setSelectedStudent(student)}
                      >
                        {student?.avatar_url ? (
                          <img src={student.avatar_url} alt={student.full_name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-stone-500 text-sm font-semibold">
                              {student?.full_name?.[0] || '?'}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 text-sm truncate">
                            {student?.full_name || 'Unknown'}
                          </p>
                          <p className="text-stone-500 text-xs truncate">
                            {student?.roll_number ? `${student.roll_number} · ` : ''}{student?.email}
                          </p>
                        </div>

                        {activeTab === 'attendance' && (
                          <button
                            onClick={e => { e.stopPropagation(); toggleAttendance(student.id, isPresent) }}
                            disabled={attendanceLoading === student.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}>
                            {isPresent
                              ? <><CheckCircle size={13} /> Present</>
                              : <><Circle size={13} /> Absent</>}
                          </button>
                        )}

                        {activeTab === 'students' && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                            }`}>
                              {isPresent ? 'Attended' : 'Registered'}
                            </span>
                            <span className="text-stone-300 text-xs">›</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-out side panel */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto animate-fade-in">
            <div className="p-6 space-y-6">

              <div className="flex items-center justify-between">
                <h2 className="font-bold text-stone-900 text-lg">Student Details</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center py-4 bg-stone-50 rounded-2xl">
                {selectedStudent?.avatar_url ? (
                  <img src={selectedStudent.avatar_url} alt={selectedStudent.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center border-4 border-white shadow-md">
                    <User size={28} className="text-stone-500" />
                  </div>
                )}
                <h3 className="font-bold text-stone-900 text-xl mt-3">
                  {selectedStudent?.full_name || 'Unknown'}
                </h3>
                <p className="text-stone-500 text-sm">{selectedStudent?.email}</p>
                <span className="mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {attendance.includes(selectedStudent?.id) ? '✓ Attended' : 'Registered'}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Academic Info</h3>
                {[
                  { icon: Hash, label: 'Roll Number', value: selectedStudent?.roll_number },
                  { icon: BookOpen, label: 'Branch', value: selectedStudent?.branch },
                  { icon: BookOpen, label: 'Year of Study', value: selectedStudent?.year_of_study },
                  { icon: Phone, label: 'Phone', value: selectedStudent?.phone },
                  { icon: User, label: 'Gender', value: selectedStudent?.gender },
                  { icon: User, label: 'Age', value: selectedStudent?.age ? `${selectedStudent.age} years` : null },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-stone-100">
                      <Icon size={14} className="text-stone-500" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">{label}</p>
                      <p className="text-sm font-semibold text-stone-900">
                        {value || <span className="text-stone-300 font-normal">Not provided</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => toggleAttendance(selectedStudent.id, attendance.includes(selectedStudent.id))}
                disabled={attendanceLoading === selectedStudent.id}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                  attendance.includes(selectedStudent.id)
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-stone-900 text-white hover:bg-stone-700'
                }`}>
                {attendanceLoading === selectedStudent.id ? 'Updating...' :
                  attendance.includes(selectedStudent.id) ? '✓ Mark as Absent' : 'Mark as Present'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}