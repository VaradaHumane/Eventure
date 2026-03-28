'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StudentProfilePanel from '@/components/ui/StudentProfilePanel'
import { Users, Search, ShieldCheck, UserCheck, User } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      await fetchUsers()
    }
    init()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleRoleChange = async (userId, newRole) => {
    const confirmed = window.confirm(`Change this user's role to "${newRole}"?`)
    if (!confirmed) return
    setRoleLoading(userId)
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setRoleLoading(null)
  }

  const roleConfig = {
    admin: { label: 'Admin', color: 'bg-amber-100 text-amber-700', icon: ShieldCheck },
    organiser: { label: 'Organiser', color: 'bg-violet-100 text-violet-700', icon: UserCheck },
    student: { label: 'Student', color: 'bg-emerald-100 text-emerald-700', icon: User },
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleCounts = {
    admin: users.filter(u => u.role === 'admin').length,
    organiser: users.filter(u => u.role === 'organiser').length,
    student: users.filter(u => u.role === 'student').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-lora)' }}>
            Users
          </h1>
          <p className="text-stone-500 mt-1">Manage roles and view student profiles</p>
        </div>

        {/* Role stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(roleCounts).map(([role, count]) => {
            const config = roleConfig[role]
            const Icon = config.icon
            return (
              <div key={role} className="bg-white rounded-2xl border border-stone-100 p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-900">{loading ? '—' : count}</p>
                    <p className="text-stone-500 text-sm capitalize">{role}s</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Search + filter */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900">
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="organiser">Organisers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <p className="text-stone-500 text-sm">
          {loading ? 'Loading...' : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
        </p>

        {/* Users list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 shimmer rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 shimmer rounded-lg w-1/3" />
                  <div className="h-3 shimmer rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <Users size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="divide-y divide-stone-50">
              {filteredUsers.map(user => {
                const config = roleConfig[user.role] || roleConfig.student
                const Icon = config.icon
                const isCurrentUser = user.id === currentUser?.id
                const isClickable = user.role === 'student' || user.role === 'organiser'

                return (
                  <div
                    key={user.id}
                    onClick={() => isClickable && setSelectedStudent(user)}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${isClickable ? 'hover:bg-stone-50 cursor-pointer' : ''}`}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-stone-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-stone-500 text-sm font-semibold">
                          {user.full_name?.[0] || user.email?.[0] || '?'}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-900 text-sm truncate">
                          {user.full_name || 'No name'}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                      <p className="text-stone-500 text-xs truncate">{user.email}</p>
                      <p className="text-stone-400 text-xs mt-0.5">
                        Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
                      <Icon size={11} />
                      {config.label}
                    </span>

                    {!isCurrentUser && user.role !== 'admin' && (
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {user.role === 'student' ? (
                          <button
                            onClick={() => handleRoleChange(user.id, 'organiser')}
                            disabled={roleLoading === user.id}
                            className="px-3 py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {roleLoading === user.id ? 'Updating...' : '↑ Make Organiser'}
                          </button>
                        ) : user.role === 'organiser' ? (
                          <button
                            onClick={() => handleRoleChange(user.id, 'student')}
                            disabled={roleLoading === user.id}
                            className="px-3 py-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {roleLoading === user.id ? 'Updating...' : '↓ Make Student'}
                          </button>
                        ) : null}
                      </div>
                    )}

                    {user.role === 'admin' && !isCurrentUser && (
                      <span className="text-xs text-stone-400 italic">Protected</span>
                    )}

                    {isClickable && (
                      <span className="text-stone-300 text-sm flex-shrink-0">›</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Student profile panel */}
      {selectedStudent && (
        <StudentProfilePanel
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </DashboardLayout>
  )
}