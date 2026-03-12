import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

      if (data.user.email === adminEmail) {
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = profile?.role || 'student'
      const redirectMap = {
        admin: '/admin',
        organiser: '/organiser',
        student: '/student'
      }

      return NextResponse.redirect(new URL(redirectMap[role], origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', origin))
}