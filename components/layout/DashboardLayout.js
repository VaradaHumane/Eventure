'use client'

import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import ProfileModal from '../ui/ProfileModal'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({ children }) {
  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState(null)
  const [checked, setChecked] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecked(true); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, profile_completed')
        .eq('id', user.id)
        .single()

      // Only show modal for students who haven't completed profile
      if (profile?.role === 'student' && !profile?.profile_completed) {
        setShowModal(true)
      }
      setChecked(true)
    }
    checkProfile()
  }, [])

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      {showModal && user && (
        <ProfileModal
          user={user}
          onComplete={() => setShowModal(false)}
        />
      )}
      <main className="pt-16 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {checked ? children : null}
      </main>
    </div>
  )
}