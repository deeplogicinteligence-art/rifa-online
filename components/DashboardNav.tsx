'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Ticket, LayoutDashboard, Plus, LogOut, User, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { useState } from 'react'

export default function DashboardNav({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { href: '/dashboard', label: 'Painel', icon: <LayoutDashboard size={16} /> },
    { href: '/dashboard/nova-rifa', label: 'Nova rifa', icon: <Plus size={16} /> },
  ]

  return (
    <>
      {/* Fixed nav bar — exactly --nav-height tall */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 'var(--nav-height)',
        background: 'rgba(10,10,15,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="page-container" style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          {/* Logo */}
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', flexShrink: 0,
          }}>
            <Ticket size={22} style={{ color: 'var(--accent-light)' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
              RifaOnline
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                fontSize: '0.875rem', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
                background: pathname === l.href ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: pathname === l.href ? 'var(--accent-light)' : 'var(--text-muted)',
              }}>
                {l.icon}{l.label}
              </Link>
            ))}
          </div>

          {/* Desktop user + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} className="desktop-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(124,58,237,0.2)', color: 'var(--accent-light)',
                flexShrink: 0,
              }}>
                <User size={15} />
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {profile?.nome?.split(' ')[0]}
              </span>
            </div>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
              fontSize: '0.875rem', color: 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <LogOut size={15} /> Sair
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '0.5rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0, zIndex: 99,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
              background: pathname === l.href ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: pathname === l.href ? 'var(--accent-light)' : 'var(--text-muted)',
            }}>
              {l.icon}{l.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
              {profile?.nome?.split(' ')[0]}
            </span>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
              fontSize: '0.875rem', color: '#ef4444',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
            }}>
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
