'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Ticket style={{ width: 24, height: 24, color: 'var(--accent-light)' }} />
          <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>RifaOnline</span>
        </Link>
      </div>

      {/* Centered content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in-up">
          {/* Glow */}
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', opacity: 0.08, pointerEvents: 'none', transform: 'translate(-50%, -60%)', left: '50%' }} />

          <div className="card" style={{ position: 'relative' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.375rem' }}>Entrar</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acesse sua conta para gerenciar suas rifas</p>
            </div>

            {erro && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                {erro}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" className="input" style={{ paddingLeft: '2.75rem' }} required />
                </div>
              </div>

              <div>
                <label className="label">Senha</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                  <input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••" className="input" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} required />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    {mostrarSenha ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={carregando}>
                {carregando ? 'Entrando...' : <><span>Entrar</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
            </form>

            <p style={{ fontSize: '0.875rem', textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
              Não tem conta?{' '}
              <Link href="/cadastro" style={{ color: 'var(--accent-light)', fontWeight: 500, textDecoration: 'none' }}>Criar conta grátis</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
