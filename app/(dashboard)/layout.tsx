import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <DashboardNav profile={profile} />
      {/*
        paddingTop must match --nav-height (68px) + desired gap.
        Using inline px values avoids any CSS var resolution issues in Next.js 15.
      */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '108px 24px 48px 24px',
      }}>
        {children}
      </div>
    </div>
  )
}
