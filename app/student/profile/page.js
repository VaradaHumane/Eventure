'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { User, Phone, BookOpen, Hash, Calendar, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [form, setForm] = useState({
    phone: '',
    age: '',
    year_of_study: '',
    branch: '',
    roll_number: '',
    gender: '',
  })
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setForm({
          phone: data.phone || '',
          age: data.age || '',
          year_of_study: data.year_of_study || '',
          branch: data.branch || '',
          roll_number: data.roll_number || '',
          gender: data.gender || '',
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!form.phone || !form.year_of_study || !form.branch || !form.roll_number) {
      setError('Please fill in all required fields')
      return
    }
    setSaving(true)
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
      .eq('id', profile.id)

    if (error) {
      setError('Failed to save: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto space-y-4">
          <div className="h-8 shimmer rounded-xl w-1/3" />
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center gap-4">
          <Link href="/student" className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
              My Profile
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">Update your details anytime</p>
          </div>
        </div>

        {/* Avatar + name card */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-stone-200" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
              <User size={24} className="text-stone-500" />
            </div>
          )}
          <div>
            <p className="font-bold text-stone-900 text-lg">{profile?.full_name || 'No name'}</p>
            <p className="text-stone-500 text-sm">{profile?.email}</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-1 inline-block">
              {profile?.role}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
            ✓ Profile saved successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
          <h2 className="font-bold text-stone-900">Academic Details</h2>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Roll Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" name="roll_number" value={form.roll_number} onChange={handleChange}
                placeholder="e.g. 21CE045"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Branch / Department <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" name="branch" value={form.branch} onChange={handleChange}
                placeholder="e.g. Computer Engineering"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Year of Study <span className="text-red-400">*</span>
              </label>
              <select name="year_of_study" value={form.year_of_study} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-700">
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
                <input type="number" name="age" value={form.age} onChange={handleChange}
                  placeholder="e.g. 20" min="15" max="30"
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Gender</label>
            <div className="flex gap-3">
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} type="button"
                  onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.gender === g
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50 text-sm"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </DashboardLayout>
  )
}