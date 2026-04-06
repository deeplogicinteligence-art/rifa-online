import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Ticket, TrendingUp, CheckCircle, Clock, Trophy } from 'lucide-react'
import { formatarMoeda, formatarData } from '@/lib/utils'
import { Rifa } from '@/lib/types'

function statusBadge(status: string) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    ativa:     { label: 'Ativa',     style: { background: 'rgba(16,185,129,0.1)',  color: '#10b981', border: '1px solid rgba(16,185,129,0.3)'  } },
    encerrada: { label: 'Encerrada', style: { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.3)' } },
    cancelada: { label: 'Cancelada', style: { background: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)'   } },
    sorteada:  { label: 'Sorteada',  style: { background: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)'  } },
  }
  const s = map[status] || map.ativa
  return (
    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: 9999, fontWeight: 600, ...s.style }}>
      {s.label}
    </span>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rifas } = await supabase
    .from('rifas')
    .select('*, numeros(status)')
    .eq('criador_id', user!.id)
    .order('created_at', { ascending: false })

  const totalArrecadado = (rifas || []).reduce((acc: number, r: Rifa & { numeros: { status: string }[] }) => {
    const pagos = r.numeros?.filter((n: { status: string }) => n.status === 'pago').length || 0
    return acc + pagos * Number(r.valor_numero)
  }, 0)

  const rifasAtivas = (rifas || []).filter((r: Rifa) => r.status === 'ativa').length

  return (
    <>
      {/* Hover style for rifa cards — safe in server component */}
      <style>{`
        .rifa-card { transition: border-color 0.2s, background 0.2s; }
        .rifa-card:hover { border-color: var(--accent) !important; background: rgba(124,58,237,0.04) !important; }
      `}</style>

      <div className="animate-fade-in-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Painel</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gerencie suas rifas</p>
          </div>
          <Link href="/dashboard/nova-rifa" className="btn-primary">
            <Plus size={16} /> Nova rifa
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total arrecadado', value: formatarMoeda(totalArrecadado), icon: <TrendingUp size={18} />, color: '#10b981' },
            { label: 'Rifas ativas',     value: rifasAtivas,                    icon: <Ticket size={18} />,     color: 'var(--accent-light)' },
            { label: 'Total de rifas',   value: rifas?.length || 0,             icon: <CheckCircle size={18} />, color: '#a78bfa' },
            { label: 'Sorteadas',        value: (rifas || []).filter((r: Rifa) => r.status === 'sorteada').length, icon: <Trophy size={18} />, color: '#fbbf24' },
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

        {/* Lista de rifas */}
        <div className="card">
          <h2 style={{ fontSize: '1.0625rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1.5rem' }}>Suas rifas</h2>

          {!rifas || rifas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <Ticket size={52} style={{ margin: '0 auto 1rem', opacity: 0.12 }} />
              <p style={{ fontSize: '1.125rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma rifa ainda</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Crie sua primeira rifa e comece a arrecadar</p>
              <Link href="/dashboard/nova-rifa" className="btn-primary">
                <Plus size={16} /> Criar primeira rifa
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rifas.map((rifa: Rifa & { numeros: { status: string }[] }) => {
                const pagos = rifa.numeros?.filter((n: { status: string }) => n.status === 'pago').length || 0
                const reservados = rifa.numeros?.filter((n: { status: string }) => n.status === 'reservado').length || 0
                const progresso = Math.round((pagos / rifa.quantidade_numeros) * 100)

                return (
                  <Link
                    key={rifa.id}
                    href={`/dashboard/rifas/${rifa.id}`}
                    className="rifa-card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.125rem', borderRadius: '0.875rem',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Thumbnail */}
                    {rifa.foto_url ? (
                      <img src={rifa.foto_url} alt={rifa.titulo}
                        style={{ width: 52, height: 52, borderRadius: '0.625rem', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: '0.625rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.1)' }}>
                        <Ticket size={22} style={{ color: 'var(--accent-light)' }} />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                          {rifa.titulo}
                        </span>
                        {statusBadge(rifa.status)}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.775rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span>{formatarMoeda(rifa.valor_numero)} / número</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {formatarData(rifa.data_sorteio)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          <span>{pagos} pagos · {reservados} reservados</span>
                          <span>{progresso}%</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 9999, overflow: 'hidden', background: 'var(--border)' }}>
                          <div style={{ height: '100%', borderRadius: 9999, width: `${progresso}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                        </div>
                      </div>
                    </div>

                    {/* Valor arrecadado */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontFamily: 'Syne, sans-serif', fontSize: '1rem', color: 'var(--text)' }}>
                        {formatarMoeda(pagos * Number(rifa.valor_numero))}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>arrecadado</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
