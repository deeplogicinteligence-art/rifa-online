import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatarMoeda, formatarData, politicaLabel } from '@/lib/utils'
import GradeNumeros from '@/components/GradeNumeros'
import { Calendar, Key, Info, Trophy, Clock, AlertCircle, Ticket } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: rifa } = await supabase.from('rifas').select('titulo, descricao, foto_url').eq('slug', slug).single()
  if (!rifa) return { title: 'Rifa não encontrada' }
  return { title: rifa.titulo, description: rifa.descricao || `Participe da rifa: ${rifa.titulo}`, openGraph: { images: rifa.foto_url ? [rifa.foto_url] : [] } }
}

export default async function RifaPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: rifa } = await supabase.from('rifas').select('*').eq('slug', slug).single()
  if (!rifa) notFound()

  const { data: numeros } = await supabase.from('numeros').select('id, numero, status').eq('rifa_id', rifa.id).order('numero')

  const pagos = numeros?.filter(n => n.status === 'pago').length || 0
  const reservados = numeros?.filter(n => n.status === 'reservado').length || 0
  const progresso = Math.round((pagos / rifa.quantidade_numeros) * 100)
  const encerrada = rifa.status === 'sorteada' || rifa.status === 'cancelada' || rifa.status === 'encerrada'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '4rem' }}>
      {/* Topbar simples */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={20} style={{ color: 'var(--accent-light)' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem' }}>RifaOnline</span>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Hero ── */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {rifa.foto_url && (
            <img src={rifa.foto_url} alt={rifa.titulo}
              style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: '1rem', flexShrink: 0, border: '1px solid var(--border)' }} />
          )}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, lineHeight: 1.2 }}>{rifa.titulo}</h1>
              {rifa.status === 'sorteada' && (
                <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: 9999, fontWeight: 600, flexShrink: 0, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  🏆 Sorteada
                </span>
              )}
            </div>

            {rifa.descricao && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>{rifa.descricao}</p>
            )}

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
              {[
                { icon: <Key size={14} />, label: 'Valor por número', value: formatarMoeda(rifa.valor_numero) },
                { icon: <Calendar size={14} />, label: 'Data do sorteio', value: formatarData(rifa.data_sorteio) },
                { icon: <Clock size={14} />, label: 'Limite de pagamento', value: formatarData(rifa.data_limite_pagamento) },
                { icon: <Trophy size={14} />, label: 'Números', value: `${rifa.quantidade_numeros} no total` },
              ].map((d, i) => (
                <div key={i} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-light)', marginBottom: '0.25rem' }}>
                    {d.icon}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.label}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Progresso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.375rem', color: 'var(--text-muted)' }}>
                <span>{pagos} pagos · {reservados} reservados</span>
                <span style={{ fontWeight: 700 }}>{progresso}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 9999, overflow: 'hidden', background: 'var(--surface-2)' }}>
                <div style={{ height: '100%', borderRadius: 9999, width: `${progresso}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Ganhador ── */}
        {rifa.status === 'sorteada' && rifa.numero_ganhador && (
          <div style={{ padding: '1.25rem', borderRadius: '1rem', marginBottom: '1.25rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🏆</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: 'Syne, sans-serif', color: '#fbbf24' }}>Número sorteado: #{rifa.numero_ganhador}</div>
              {rifa.resultado_loteria && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Loteria Federal: {rifa.resultado_loteria}</div>}
            </div>
          </div>
        )}

        {/* ── Pix ── */}
        {!encerrada && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Como pagar</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Após reservar seu número, faça o Pix para a chave abaixo e aguarde a confirmação do organizador.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem', background: 'var(--surface-2)', border: '1px dashed var(--accent)' }}>
              <Key size={18} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'Syne, sans-serif', wordBreak: 'break-all' }}>{rifa.chave_pix}</span>
            </div>
          </div>
        )}

        {/* ── Política ── */}
        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '1rem', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <Info size={15} style={{ color: 'var(--accent-light)', flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Se não preencher todos os números:</strong>{' '}{politicaLabel(rifa.politica_incompleta)}
          </p>
        </div>

        {/* ── Observações ── */}
        {rifa.observacoes && (
          <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <AlertCircle size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '0.125rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rifa.observacoes}</p>
          </div>
        )}

        {/* ── Grade ── */}
        <div className="card">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
            {encerrada ? 'Números da rifa' : 'Escolha seu(s) número(s)'}
          </h2>
          <GradeNumeros
            numeros={numeros || []}
            rifaId={rifa.id}
            valorNumero={Number(rifa.valor_numero)}
            chavePix={rifa.chave_pix}
            tituloRifa={rifa.titulo}
            dataLimite={rifa.data_limite_pagamento}
            encerrada={encerrada}
          />
        </div>
      </div>
    </main>
  )
}
