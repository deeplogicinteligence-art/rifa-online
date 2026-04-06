import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { formatarMoeda, formatarData, politicaLabel } from '@/lib/utils'
import { Numero, Participante } from '@/lib/types'
import AcoesNumeroBtn from '@/components/AcoesNumeroBtn'
import CopiarLinkBtn from '@/components/CopiarLinkBtn'
import { Ticket, Users, CheckCircle, Clock, Trophy, Calendar, Key, ExternalLink } from 'lucide-react'

export default async function RifaAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rifa } = await supabase
    .from('rifas').select('*').eq('id', id).eq('criador_id', user.id).single()
  if (!rifa) notFound()

  const { data: numeros } = await supabase
    .from('numeros').select('*, participantes(*)').eq('rifa_id', id).order('numero')

  const pagos       = numeros?.filter(n => n.status === 'pago').length || 0
  const reservados  = numeros?.filter(n => n.status === 'reservado').length || 0
  const disponiveis = numeros?.filter(n => n.status === 'disponivel').length || 0
  const progresso   = Math.round((pagos / rifa.quantidade_numeros) * 100)
  const arrecadado  = pagos * Number(rifa.valor_numero)
  const linkPublico = `${process.env.NEXT_PUBLIC_APP_URL}/r/${rifa.slug}`

  const numerosAtivos = numeros?.filter(n => n.status !== 'disponivel') || []

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {rifa.foto_url ? (
          <img src={rifa.foto_url} alt={rifa.titulo}
            style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: '1rem', flexShrink: 0, border: '1px solid var(--border)' }} />
        ) : (
          <div style={{ width: 140, height: 140, borderRadius: '1rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.1)', border: '1px solid var(--border)' }}>
            <Ticket size={40} style={{ color: 'var(--accent-light)' }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {rifa.titulo}
          </h1>
          {rifa.descricao && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>{rifa.descricao}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <CopiarLinkBtn link={linkPublico} />
            <a href={linkPublico} target="_blank" className="btn-secondary" style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
              <ExternalLink size={15} /> Ver página pública
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Arrecadado',  value: formatarMoeda(arrecadado), icon: <CheckCircle size={18} />, color: '#10b981' },
          { label: 'Pagos',       value: pagos,                      icon: <Trophy size={18} />,      color: 'var(--accent-light)' },
          { label: 'Reservados',  value: reservados,                 icon: <Clock size={18} />,       color: '#f59e0b' },
          { label: 'Disponíveis', value: disponiveis,                icon: <Ticket size={18} />,      color: 'var(--text-muted)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1.125rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: s.color }}>
              {s.icon}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.625rem', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Progresso ── */}
      <div className="card" style={{ padding: '1.125rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>Progresso</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-light)' }}>
            {progresso}% ({pagos}/{rifa.quantidade_numeros})
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 9999, overflow: 'hidden', background: 'var(--surface-2)' }}>
          <div style={{ height: '100%', borderRadius: 9999, width: `${progresso}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* ── Detalhes + Legenda ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1rem' }}>Detalhes da rifa</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { icon: <Key size={15} />,      label: 'Chave Pix',           value: rifa.chave_pix },
              { icon: <Calendar size={15} />, label: 'Limite pagamento',    value: formatarData(rifa.data_limite_pagamento) },
              { icon: <Calendar size={15} />, label: 'Data do sorteio',     value: formatarData(rifa.data_sorteio) },
              { icon: <Users size={15} />,    label: 'Política incompleta', value: politicaLabel(rifa.politica_incompleta) },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--accent-light)', marginTop: '0.125rem', flexShrink: 0 }}>{d.icon}</span>
                <div><span style={{ color: 'var(--text-muted)' }}>{d.label}: </span><span style={{ fontWeight: 500 }}>{d.value}</span></div>
              </div>
            ))}
            {rifa.observacoes && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.625rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', lineHeight: 1.5 }}>
                📝 {rifa.observacoes}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1rem' }}>Legenda</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { bg: 'var(--surface-2)',     border: 'var(--border)',                color: 'var(--text-muted)', label: 'Disponível',                      count: disponiveis },
              { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',         color: '#f59e0b',           label: 'Reservado (aguardando pagamento)', count: reservados  },
              { bg: 'rgba(124,58,237,0.15)',border: 'rgba(124,58,237,0.4)',         color: '#a78bfa',           label: 'Pago e confirmado',               count: pagos       },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '0.375rem', flexShrink: 0, background: l.bg, border: `1px solid ${l.border}` }} />
                <span style={{ flex: 1, color: 'var(--text-muted)' }}>{l.label}</span>
                <span style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif', color: l.color }}>{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Participantes ── */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1.25rem' }}>
          Números e participantes
        </h3>

        {numerosAtivos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>Nenhum número reservado ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {numerosAtivos.map((n: Numero & { participantes: Participante }) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1rem', borderRadius: '0.75rem',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                flexWrap: 'wrap',
              }}>
                {/* Badge do número */}
                <div style={{
                  width: 44, height: 44, borderRadius: '0.5rem', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.875rem', fontFamily: 'Syne, sans-serif',
                  ...(n.status === 'pago'
                    ? { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }
                    : { background: 'rgba(245,158,11,0.1)',  border: '1px solid rgba(245,158,11,0.3)',  color: '#f59e0b' }),
                }}>
                  {n.numero}
                </div>

                {/* Info participante */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.125rem' }}>
                    {n.participantes?.nome}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {n.participantes?.email} · {n.participantes?.telefone}
                  </div>
                </div>

                {/* Ações */}
                <AcoesNumeroBtn
                  numeroId={n.id}
                  rifaId={rifa.id}
                  status={n.status as 'reservado' | 'pago'}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
