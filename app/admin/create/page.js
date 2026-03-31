'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useRouter } from 'next/navigation'
import { Upload, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminCreateEventPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    end_date: '',
    location: '',
    capacity: '',
    category_id: '',
    tags: '',
    requires_performance_form: false,
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: cats } = await supabase.from('categories').select('*')
      setCategories(cats || [])
    }
    init()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (submitStatus) => {
    if (!form.title || !form.date) {
      setError('Title and date are required')
      return
    }
    setLoading(true)
    setError(null)

    let image_url = null

    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, image)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { error: insertError } = await supabase
      .from('events')
      .insert({
        title: form.title,
        description: form.description || null,
        date: new Date(form.date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        location: form.location || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        category_id: form.category_id || null,
        image_url,
        organiser_id: user.id,
        status: submitStatus,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        requires_performance_form: form.requires_performance_form,
      })

    if (insertError) {
      setError('Failed to create event: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/events')
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
              Create Event
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              As admin, you can publish directly without approval
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Event Banner Image</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden h-48">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImage(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all">
                <Upload size={24} className="text-stone-400 mb-2" />
                <span className="text-sm text-stone-500 font-medium">Click to upload image</span>
                <span className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Event Title <span className="text-red-400">*</span>
            </label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Annual Tech Fest 2025"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} placeholder="Tell students what this event is about..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Start Date & Time <span className="text-red-400">*</span>
              </label>
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">End Date & Time</label>
              <input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Main Auditorium, Block A"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>

          {/* Category + Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-700">
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                placeholder="e.g. 100" min="1"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Tags <span className="text-stone-400 font-normal">(comma separated)</span>
            </label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="e.g. coding, hackathon, prizes"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>

          {/* Performance form toggle */}
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-violet-900">Performance Registration Form</p>
                <p className="text-violet-600 text-xs mt-0.5 leading-relaxed">
                  Enable this for dance, singing, music or drama competitions — students will fill in performance details when registering
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, requires_performance_form: !prev.requires_performance_form }))}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                  form.requires_performance_form ? 'bg-violet-600' : 'bg-stone-300'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.requires_performance_form ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            {form.requires_performance_form && (
              <p className="text-violet-700 text-xs mt-3 pt-3 border-t border-violet-200">
                ✓ Students will be asked for solo/group, song track, duration and special notes when registering for this event
              </p>
            )}
          </div>

        </div>

        {/* Admin publish options */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-800 text-xs font-semibold mb-3 uppercase tracking-wide">Admin Publish Options</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Publishing...' : '⚡ Publish Immediately'}
            </button>
          </div>
          <p className="text-amber-700 text-xs mt-2">
            Publishing immediately skips the approval process and makes the event visible to students right away.
          </p>
        </div>

      </div>
    </DashboardLayout>
  )
}