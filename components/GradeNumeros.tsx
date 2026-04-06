'use client'
import { useState } from 'react'
import { X, Ticket, Loader2, Check, Key } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'

interface NumeroItem { id: string; numero: number; status: string }
interface Props {
  numeros: NumeroItem[]
  rifaId: string
  valorNumero: number
  chavePix: string
  tituloRifa: string
  dataLimite: string
  encerrada: boolean
}

export default function GradeNumeros({ numeros, rifaId, valorNumero, chavePix, tituloRifa, dataLimite, encerrada }: Props) {
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [modal, setModal] = useState(false)
  const [etapa, setEtapa] = useState<'form' | 'pix'>('form')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' })

  const total = numeros.length
  const cols = total <= 25 ? 5 : total <= 100 ? 10 : 20

  function toggleNumero(n: NumeroItem) {
    if (n.status !== 'disponivel' || encerrada) return
    setSelecionados(prev => prev.includes(n.numero) ? prev.filter(x => x !== n.numero) : [...prev, n.numero])
  }

  function getClasse(n: NumeroItem) {
    if (selecionados.includes(n.numero)) return 'numero-selecionado'
    if (n.status === 'pago') return 'numero-pago'
    if (n.status === 'reservado') return 'numero-reservado'
    return 'numero-disponivel'
  }

  async function handleReservar() {
    if (!form.nome.trim()) return setErro('Informe seu nome.')
    if (!form.email.includes('@')) return setErro('E-mail inválido.')
    if (!form.telefone.replace(/\D/g, '').match(/^\d{10,11}$/)) return setErro('Telefone inválido.')
    setCarregando(true); setErro('')
    const res = await fetch(`/api/rifas/${rifaId}/reservar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeros: selecionados, ...form }),
    })
    setCarregando(false)
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error || 'Erro ao reservar. Tente novamente.')
    } else {
      setEtapa('pix')
    }
  }

  function fecharModal() {
    setModal(false); setSelecionados([])
    setForm({ nome: '', email: '', telefone: '' })
    setEtapa('form'); setErro('')
    window.location.reload()
  }

  const fontSize = total >= 200 ? '0.65rem' : total >= 100 ? '0.75rem' : '0.85rem'

  return (
    <>
      {/* Legenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { cls: 'numero-disponivel', label: 'Disponível' },
          { cls: 'numero-reservado', label: 'Reservado' },
          { cls: 'numero-pago', label: 'Pago' },
          ...(!encerrada ? [{ cls: 'numero-selecionado', label: 'Selecionado' }] : []),
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div className={l.cls} style={{ width: 22, height: 22, minWidth: 22, fontSize: '0.6rem', pointerEvents: 'none' }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Grade */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '0.375rem', marginBottom: '1.5rem' }}>
        {numeros.map(n => (
          <button key={n.id} onClick={() => toggleNumero(n)} className={getClasse(n)}
            style={{ fontSize, padding: 0, minHeight: 36 }}>
            {n.numero}
          </button>
        ))}
      </div>

      {/* Footer */}
      {!encerrada && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            {selecionados.length > 0 ? (
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                  {selecionados.length} número{selecionados.length > 1 ? 's' : ''} selecionado{selecionados.length > 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '0.875rem', marginLeft: '0.5rem', color: 'var(--accent-light)', fontWeight: 600 }}>
                  = {formatarMoeda(selecionados.length * valorNumero)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Clique nos números disponíveis para selecionar</span>
            )}
          </div>
          <button onClick={() => { setModal(true); setEtapa('form'); setErro('') }}
            disabled={selecionados.length === 0} className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
            <Ticket size={16} /> Reservar
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          padding: '1rem',
        }}>
          {/* sm: center */}
          <div style={{
            width: '100%', maxWidth: 460,
            borderRadius: '1.25rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '1.75rem',
            animation: 'fadeInUp 0.25s ease',
            marginBottom: 'env(safe-area-inset-bottom)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                {etapa === 'form' ? 'Seus dados' : '🎉 Quase lá!'}
              </h3>
              <button onClick={fecharModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            </div>

            {etapa === 'form' && (
              <>
                {/* Resumo */}
                <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-light)', fontWeight: 600 }}>
                    🎟️ Números: <strong>{selecionados.sort((a, b) => a - b).join(', ')}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Total: <strong style={{ color: 'var(--text)' }}>{formatarMoeda(selecionados.length * valorNumero)}</strong>
                  </div>
                </div>

                {erro && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    {erro}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Nome completo</label>
                    <input type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Seu nome" className="input" />
                  </div>
                  <div>
                    <label className="label">E-mail</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="seu@email.com" className="input" />
                  </div>
                  <div>
                    <label className="label">WhatsApp</label>
                    <input type="tel" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999" className="input" />
                  </div>
                  <button onClick={handleReservar} disabled={carregando} className="btn-primary"
                    style={{ width: '100%', marginTop: '0.25rem', padding: '0.875rem' }}>
                    {carregando
                      ? <><Loader2 size={16} className="animate-spin" /> Reservando...</>
                      : 'Reservar e ver Pix'}
                  </button>
                </div>
              </>
            )}

            {etapa === 'pix' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Seus números foram reservados! Faça o Pix abaixo para confirmar sua participação.
                </p>

                <div style={{ padding: '1.25rem', borderRadius: '0.875rem', background: 'var(--surface-2)', border: '1px dashed var(--accent)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                    <Key size={13} /> Chave Pix
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', wordBreak: 'break-all', marginBottom: '0.75rem' }}>
                    {chavePix}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--accent-light)' }}>
                    {formatarMoeda(selecionados.length * valorNumero)}
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.82rem', color: '#f59e0b', textAlign: 'center' }}>
                  ⚠️ Você tem 48h para pagar — após isso os números serão liberados.
                </div>

                <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Você receberá um e-mail quando o organizador confirmar seu pagamento.
                </p>

                <button onClick={fecharModal} className="btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                  <Check size={16} /> Já fiz o Pix, obrigado!
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
