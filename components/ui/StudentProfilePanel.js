'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, User, Phone, Hash, BookOpen, Calendar, Mail, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import CategoryPill from './CategoryPill'

export default function StudentProfilePanel({ student, onClose }) {
  const [registrations, setRegistrations] = useState([])
  const [attendanceRate, setAttendanceRate] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!student) return
    fetchStudentData()
  }, [student])

  const fetchStudentData = async () => {
    setLoading(true)

    // Fetch all registrations with event details
    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select(`*, events(id, title, date, status, categories(name))`)
      .eq('student_id', student.id)
      .order('registered_at', { ascending: false })

    // Fetch attendance count
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('event_id')
      .eq('student_id', student.id)

    const regs = rsvpData || []
    const attended = attendanceData?.length || 0
    const rate = regs.length > 0 ? Math.round((attended / regs.length) * 100) : 0

    setRegistrations(regs)
    setAttendanceRate(rate)
    setLoading(false)
  }

  if (!student) return null

  const details = [
    { icon: Mail, label: 'Email', value: student.email },
    { icon: Hash, label: 'Roll Number', value: student.roll_number },
    { icon: BookOpen, label: 'Branch', value: student.branch },
    { icon: BookOpen, label: 'Year of Study', value: student.year_of_study },
    { icon: Phone, label: 'Phone', value: student.phone },
    { icon: User, label: 'Gender', value: student.gender },
    { icon: User, label: 'Age', value: student.age ? `${student.age} years` : null },
    { icon: Calendar, label: 'Joined', value: student.created_at ? format(new Date(student.created_at), 'MMM d, yyyy') : null },
  ]

  const statusColors = {
    published: 'bg-emerald-100 text-emerald-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-stone-100 text-stone-500',
    draft: 'bg-stone-100 text-stone-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto animate-fade-in flex flex-col">
        <div className="p-6 space-y-6 flex-1">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-900 text-lg">Student Profile</h2>
            <button onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500">
              <X size={18} />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center py-4 bg-stone-50 rounded-2xl">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.full_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center border-4 border-white shadow-md">
                <User size={28} className="text-stone-500" />
              </div>
            )}
            <h3 className="font-bold text-stone-900 text-xl mt-3">
              {student.full_name || 'No name'}
            </h3>
            <p className="text-stone-500 text-sm">{student.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 capitalize">
                {student.role}
              </span>
              {!student.profile_completed && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  Profile incomplete
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '—' : registrations.length}
              </p>
              <p className="text-stone-500 text-xs mt-0.5">Registered</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {loading ? '—' : `${attendanceRate}%`}
              </p>
              <p className="text-stone-500 text-xs mt-0.5">Attendance Rate</p>
            </div>
          </div>

          {/* Academic details */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              Academic Info
            </h3>
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-stone-100">
                  <Icon size={14} className="text-stone-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">{label}</p>
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {value || <span className="text-stone-300 font-normal">Not provided</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Registered events */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              Registered Events ({registrations.length})
            </h3>

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 shimmer rounded-xl" />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-xl">
                <p className="text-stone-400 text-sm">No events registered yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {registrations.map(reg => {
                  const event = reg.events
                  if (!event) return null
                  return (
                    <div key={reg.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-10 h-10 bg-stone-900 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-amber-400 text-xs font-bold leading-none">
                          {format(new Date(event.date), 'MMM')}
                        </span>
                        <span className="text-white text-sm font-bold leading-none">
                          {format(new Date(event.date), 'd')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {event.categories?.name && (
                            <CategoryPill name={event.categories.name} size="sm" />
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[event.status] || 'bg-stone-100 text-stone-500'}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}