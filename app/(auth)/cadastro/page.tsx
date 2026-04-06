'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, Mail, Lock, User, Phone, CreditCard, ArrowRight, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validarCPFLocal, formatarCPF, formatarTelefone } from '@/lib/cpf'

export default function CadastroPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState(1)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [validandoCPF, setValidandoCPF] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', senha: '', confirmarSenha: '' })

  function set(campo: string, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }))
    setErro('')
  }

  async function validarEtapa1() {
    if (!form.nome.trim()) return setErro('Informe seu nome completo.')
    if (!form.email.includes('@')) return setErro('E-mail inválido.')
    if (form.senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')
    if (form.senha !== form.confirmarSenha) return setErro('As senhas não coincidem.')
    setEtapa(2); setErro('')
  }

  async function validarEtapa2() {
    const cpfLimpo = form.cpf.replace(/\D/g, '')
    if (!validarCPFLocal(cpfLimpo)) return setErro('CPF inválido.')
    if (!form.telefone.replace(/\D/g, '').match(/^\d{10,11}$/)) return setErro('Telefone inválido.')
    setValidandoCPF(true); setErro('')
    await new Promise(r => setTimeout(r, 800))
    setValidandoCPF(false)
    handleCadastro()
  }

  async function handleCadastro() {
    setCarregando(true)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.senha,
      options: { data: { nome: form.nome } },
    })
    if (authError || !data.user) {
      setErro(authError?.message === 'User already registered' ? 'Este e-mail já está cadastrado.' : 'Erro ao criar conta. Tente novamente.')
      setCarregando(false); return
    }
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, nome: form.nome, email: form.email,
      telefone: form.telefone.replace(/\D/g, ''),
      cpf: form.cpf.replace(/\D/g, ''), cpf_validado: true,
    })
    if (profileError) {
      setErro('Erro ao salvar perfil. Tente novamente.')
      setCarregando(false); return
    }
    router.push('/dashboard')
  }

  const inputWithIcon = (icon: React.ReactNode, input: React.ReactNode) => (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
        {icon}
      </div>
      {input}
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Ticket style={{ width: 24, height: 24, color: 'var(--accent-light)' }} />
          <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>RifaOnline</span>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in-up">

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[1, 2].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, flexShrink: 0, transition: 'all 0.3s',
                  background: etapa >= n ? 'var(--accent)' : 'var(--surface-2)',
                  color: etapa >= n ? 'white' : 'var(--text-muted)',
                  border: etapa >= n ? 'none' : '1px solid var(--border)',
                }}>
                  {etapa > n ? <CheckCircle style={{ width: 16, height: 16 }} /> : n}
                </div>
                {n < 2 && <div style={{ height: 2, flex: 1, borderRadius: 9999, background: etapa > n ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          <div className="card">
            {etapa === 1 ? (
              <>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h1 style={{ fontSize: '1.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.375rem' }}>Criar conta</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dados de acesso à plataforma</p>
                </div>
                {erro && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{erro}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Nome completo</label>
                    {inputWithIcon(<User style={{ width: 16, height: 16 }} />, <input type="text" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome completo" className="input" style={{ paddingLeft: '2.75rem' }} />)}
                  </div>
                  <div>
                    <label className="label">E-mail</label>
                    {inputWithIcon(<Mail style={{ width: 16, height: 16 }} />, <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" className="input" style={{ paddingLeft: '2.75rem' }} />)}
                  </div>
                  <div>
                    <label className="label">Senha</label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                      <input type={mostrarSenha ? 'text' : 'password'} value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="Mínimo 6 caracteres" className="input" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} />
                      <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        {mostrarSenha ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirmar senha</label>
                    {inputWithIcon(<Lock style={{ width: 16, height: 16 }} />, <input type="password" value={form.confirmarSenha} onChange={e => set('confirmarSenha', e.target.value)} placeholder="Repita a senha" className="input" style={{ paddingLeft: '2.75rem' }} />)}
                  </div>
                  <button onClick={validarEtapa1} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Próximo <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h1 style={{ fontSize: '1.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.375rem' }}>Verificação</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Precisamos validar sua identidade para criar rifas</p>
                </div>
                {erro && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{erro}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">CPF</label>
                    {inputWithIcon(<CreditCard style={{ width: 16, height: 16 }} />, <input type="text" value={form.cpf} onChange={e => set('cpf', formatarCPF(e.target.value))} placeholder="000.000.000-00" className="input" style={{ paddingLeft: '2.75rem' }} maxLength={14} />)}
                  </div>
                  <div>
                    <label className="label">Telefone (WhatsApp)</label>
                    {inputWithIcon(<Phone style={{ width: 16, height: 16 }} />, <input type="tel" value={form.telefone} onChange={e => set('telefone', formatarTelefone(e.target.value))} placeholder="(11) 99999-9999" className="input" style={{ paddingLeft: '2.75rem' }} />)}
                  </div>
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--text-muted)' }}>
                    🔒 Seu CPF é usado apenas para verificação de identidade e não será compartilhado com terceiros.
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button onClick={() => setEtapa(1)} className="btn-secondary" style={{ flex: 1 }}>Voltar</button>
                    <button onClick={validarEtapa2} disabled={carregando || validandoCPF} className="btn-primary" style={{ flex: 1 }}>
                      {validandoCPF ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Validando...</>
                        : carregando ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Criando...</>
                          : <>Criar conta <ArrowRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                  </div>
                </div>
              </>
            )}

            <p style={{ fontSize: '0.875rem', textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: 500, textDecoration: 'none' }}>Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
