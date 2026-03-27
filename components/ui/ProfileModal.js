'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, BookOpen, Hash, Users, Calendar } from 'lucide-react'

export default function ProfileModal({ user, onComplete }) {
  const [form, setForm] = useState({
    phone: '',
    age: '',
    year_of_study: '',
    branch: '',
    roll_number: '',
    gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const supabase = createClient()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.phone || !form.year_of_study || !form.branch || !form.roll_number) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        phone: form.phone,
        age: form.age ? parseInt(form.age) : null,
        year_of_study: form.year_of_study,
        branch: form.branch,
        roll_number: form.roll_number,
        gender: form.gender || null,
        profile_completed: true,
      })
      .eq('id', user.id)

    if (error) {
      setError('Failed to save: ' + error.message)
      setLoading(false)
      return
    }

    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <User size={24} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
            Complete your profile
          </h2>
          <p className="text-stone-500 text-sm">
            This information helps organisers manage events. You only need to do this once.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-3">

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Roll Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                name="roll_number"
                value={form.roll_number}
                onChange={handleChange}
                placeholder="e.g. 21CE045"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Branch / Department <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Engineering"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Year of Study <span className="text-red-400">*</span>
              </label>
              <select
                name="year_of_study"
                value={form.year_of_study}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-700"
              >
                <option value="">Select year</option>
                <option value="FE">FE (1st Year)</option>
                <option value="SE">SE (2nd Year)</option>
                <option value="TE">TE (3rd Year)</option>
                <option value="BE">BE (4th Year)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Age</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  min="15" max="30"
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Gender</label>
            <div className="flex gap-3">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.gender === g
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>

        <p className="text-xs text-stone-400 text-center">
          You can update this information anytime from your profile settings.
        </p>
      </div>
    </div>
  )
}