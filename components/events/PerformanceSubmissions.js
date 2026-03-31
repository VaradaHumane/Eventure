'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Edit2, Check, X, Music, Users, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function PerformanceSubmissions({ eventId }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteLoading, setDeleteLoading] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
  }, [eventId])

  const fetchSubmissions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('performance_registrations')
      .select(`*, profiles(full_name, email, avatar_url, roll_number, branch)`)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    setSubmissions(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this performance submission?')
    if (!confirmed) return
    setDeleteLoading(id)
    await supabase.from('performance_registrations').delete().eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    setDeleteLoading(null)
  }

  const startEdit = (submission) => {
    setEditingId(submission.id)
    setEditForm({
      song_track: submission.song_track || '',
      duration_minutes: submission.duration_minutes || '',
      special_notes: submission.special_notes || '',
      performance_type: submission.performance_type,
      group_members: submission.group_members || [],
    })
  }

  const saveEdit = async (id) => {
    await supabase
      .from('performance_registrations')
      .update({
        song_track: editForm.song_track || null,
        duration_minutes: editForm.duration_minutes ? parseInt(editForm.duration_minutes) : null,
        special_notes: editForm.special_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? {
      ...s,
      song_track: editForm.song_track || null,
      duration_minutes: editForm.duration_minutes ? parseInt(editForm.duration_minutes) : null,
      special_notes: editForm.special_notes || null,
    } : s))
    setEditingId(null)
  }

  const soloCount = submissions.filter(s => s.performance_type === 'solo').length
  const groupCount = submissions.filter(s => s.performance_type === 'group').length

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 shimmer rounded-xl" />
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Music size={20} className="text-violet-500" />
        </div>
        <p className="text-stone-900 font-semibold">No performance submissions yet</p>
        <p className="text-stone-500 text-sm mt-1">Students who register will submit their details here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-stone-100 p-3 text-center">
          <p className="text-xl font-bold text-stone-900">{submissions.length}</p>
          <p className="text-stone-500 text-xs mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-3 text-center">
          <p className="text-xl font-bold text-violet-600">{soloCount}</p>
          <p className="text-stone-500 text-xs mt-0.5">Solo</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{groupCount}</p>
          <p className="text-stone-500 text-xs mt-0.5">Group</p>
        </div>
      </div>

      {/* Submissions list */}
      <div className="space-y-3">
        {submissions.map(submission => {
          const student = submission.profiles
          const isEditing = editingId === submission.id

          return (
            <div key={submission.id} className="bg-white rounded-2xl border border-stone-100 p-5">

              {/* Student header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {student?.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name}
                      className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center">
                      <span className="text-stone-500 text-sm font-semibold">
                        {student?.full_name?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{student?.full_name || 'Unknown'}</p>
                    <p className="text-stone-500 text-xs">
                      {student?.roll_number && `${student.roll_number} · `}{student?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    submission.performance_type === 'solo'
                      ? 'bg-violet-50 text-violet-700 border border-violet-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {submission.performance_type === 'solo' ? '🎤 Solo' : '👥 Group'}
                  </span>

                  {!isEditing && (
                    <>
                      <button onClick={() => startEdit(submission)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(submission.id)}
                        disabled={deleteLoading === submission.id}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}

                  {isEditing && (
                    <>
                      <button onClick={() => saveEdit(submission.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Check size={13} />
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors">
                        <X size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Group members */}
              {submission.performance_type === 'group' && submission.group_members?.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1.5">
                    <Users size={12} />
                    Group Members
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs bg-white text-stone-700 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                      {student?.full_name} (Leader)
                    </span>
                    {submission.group_members.map((member, i) => member && (
                      <span key={i} className="text-xs bg-white text-stone-700 px-2 py-0.5 rounded-full border border-amber-200">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance details */}
              {!isEditing ? (
                <div className="space-y-2">
                  {submission.song_track && (
                    <div className="flex items-start gap-2 text-sm">
                      <Music size={13} className="text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-stone-400">Song / Track</span>
                        <p className="text-stone-800 font-medium">{submission.song_track}</p>
                      </div>
                    </div>
                  )}
                  {submission.duration_minutes && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock size={13} className="text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-stone-400">Duration</span>
                        <p className="text-stone-800 font-medium">{submission.duration_minutes} minutes</p>
                      </div>
                    </div>
                  )}
                  {submission.special_notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText size={13} className="text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-stone-400">Special Notes</span>
                        <p className="text-stone-800">{submission.special_notes}</p>
                      </div>
                    </div>
                  )}
                  {!submission.song_track && !submission.duration_minutes && !submission.special_notes && (
                    <p className="text-stone-400 text-xs italic">No additional details provided</p>
                  )}
                  <p className="text-stone-400 text-xs mt-1">
                    Submitted {format(new Date(submission.created_at), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Song / Track</label>
                    <input type="text" value={editForm.song_track}
                      onChange={e => setEditForm(prev => ({ ...prev, song_track: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Duration (minutes)</label>
                    <input type="number" value={editForm.duration_minutes}
                      onChange={e => setEditForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Special Notes</label>
                    <textarea value={editForm.special_notes}
                      onChange={e => setEditForm(prev => ({ ...prev, special_notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}