'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import CategoryPill, { categoryImageBg } from '@/components/ui/CategoryPill'
import { createClient } from '@/lib/supabase/client'

export default function EventCard({ event, onRegister, isRegistered, registerLoading, userId }) {
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [performanceType, setPerformanceType] = useState('solo')
  const [songTrack, setSongTrack] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [groupMembers, setGroupMembers] = useState(['', '', ''])
  const supabase = createClient()

  const categoryName = event.categories?.name || 'General'
  const imageBg = categoryImageBg[categoryName] || 'bg-stone-100'

  const handleRegisterClick = () => {
    if (isRegistered) {
      onRegister(event.id, true)
      return
    }
    if (event.requires_performance_form) {
      setShowForm(prev => !prev)
    } else {
      onRegister(event.id, false)
    }
  }

  const handlePerformanceSubmit = async () => {
    if (!performanceType) {
      setFormError('Please select solo or group')
      return
    }
    if (!songTrack.trim()) {
      setFormError('Please enter a song / track name')
      return
    }
    if (!duration) {
      setFormError('Please enter the performance duration')
      return
    }
    setFormLoading(true)
    setFormError(null)

    const filteredMembers = groupMembers.filter(m => m.trim() !== '')

    // Save performance registration
    const { error: perfError } = await supabase
      .from('performance_registrations')
      .upsert({
        event_id: event.id,
        student_id: userId,
        performance_type: performanceType,
        song_track: songTrack.trim() || null,
        duration_minutes: duration ? parseInt(duration) : null,
        special_notes: notes.trim() || null,
        group_members: performanceType === 'group' ? filteredMembers : null,
      }, { onConflict: 'event_id,student_id' })

    if (perfError) {
      setFormError('Failed to save performance details: ' + perfError.message)
      setFormLoading(false)
      return
    }

    // Now register for the event
    await onRegister(event.id, false)
    setShowForm(false)
    setFormLoading(false)
  }

  const updateGroupMember = (index, value) => {
    const updated = [...groupMembers]
    updated[index] = value
    setGroupMembers(updated)
  }

  const addGroupMember = () => {
    if (groupMembers.length < 3) setGroupMembers([...groupMembers, ''])
  }

  const removeGroupMember = (index) => {
    if (groupMembers.length > 1) {
      setGroupMembers(groupMembers.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:border-stone-200 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">

      {event.image_url ? (
        <div className="h-44 overflow-hidden">
          <img src={event.image_url} alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className={`h-44 ${imageBg} flex items-center justify-center`}>
          <Calendar size={36} className="text-white/60" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <CategoryPill name={categoryName} />
          {event.requires_performance_form && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              🎭 Performance
            </span>
          )}
          {event.status === 'ongoing' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live
            </span>
          )}
          {event.status === 'completed' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
              Completed
            </span>
          )}
        </div>

        <h3 className="font-bold text-stone-900 text-base leading-snug mb-2 line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-stone-500 text-sm leading-relaxed mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-1.5 mb-4 mt-auto">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <Calendar size={12} className="flex-shrink-0 text-stone-400" />
            <span>{format(new Date(event.date), 'EEE, MMM d · h:mm a')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <MapPin size={12} className="flex-shrink-0 text-stone-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <Users size={12} className="flex-shrink-0 text-stone-400" />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>

        <div className="border-t border-stone-100 pt-3 mt-auto">
          {event.status !== 'completed' ? (
            <>
              <button
                onClick={handleRegisterClick}
                disabled={registerLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isRegistered
                    ? 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600 border border-stone-200'
                    : 'bg-stone-900 text-white hover:bg-stone-700'
                }`}
              >
                {registerLoading ? 'Updating...' : isRegistered ? '✓ Registered — Cancel?' : (
                  <>
                    Register Now
                    {event.requires_performance_form && !isRegistered && (
                      showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </>
                )}
              </button>

              {/* Inline performance form */}
              {showForm && !isRegistered && event.requires_performance_form && (
                <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
                  <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                    Performance Details
                  </p>

                  {formError && (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
                  )}

                  {/* Solo or Group */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      Participation Type <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      {['solo', 'group'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPerformanceType(type)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                            performanceType === type
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {type === 'solo' ? '🎤 Solo' : '👥 Group'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group members */}
                  {performanceType === 'group' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                        Group Member Names <span className="text-stone-400">(max 4 including you)</span>
                      </label>
                      <div className="space-y-2">
                        {groupMembers.map((member, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={member}
                              onChange={e => updateGroupMember(index, e.target.value)}
                              placeholder={`Member ${index + 2} name`}
                              className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                            {groupMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeGroupMember(index)}
                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        {groupMembers.length < 3 && (
                          <button
                            type="button"
                            onClick={addGroupMember}
                            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
                          >
                            <Plus size={12} />
                            Add another member
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        You are member 1 — add up to 3 more
                      </p>
                    </div>
                  )}

                  {/* Song track */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      Song / Track Name <span className="text-stone-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={songTrack}
                      onChange={e => setSongTrack(e.target.value)}
                      placeholder="e.g. Kesariya, Tum Hi Ho..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      Performance Duration <span className="text-stone-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="e.g. 5"
                      min="1"
                      max="60"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      Special Requirements / Notes <span className="text-stone-400">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Need a microphone, specific lighting..."
                      rows={2}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handlePerformanceSubmit}
                    disabled={formLoading}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    {formLoading ? 'Registering...' : 'Confirm Registration'}
                  </button>

                  <button
                    onClick={() => setShowForm(false)}
                    className="w-full py-2 text-stone-400 hover:text-stone-600 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-stone-50 text-stone-400 border border-stone-100">
              Event Ended
            </div>
          )}
        </div>
      </div>
    </div>
  )
}