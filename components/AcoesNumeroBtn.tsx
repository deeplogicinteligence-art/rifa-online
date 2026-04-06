'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Trash2, RotateCcw } from 'lucide-react'

interface Props {
  numeroId: string
  rifaId: string
  status: 'reservado' | 'pago'
}

export default function AcoesNumeroBtn({ numeroId, rifaId, status }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function chamar(acao: 'confirmar' | 'cancelar' | 'reverter', confirmMsg: string) {
    if (!confirm(confirmMsg)) return
    setLoading(acao)
    const res = await fetch(`/api/rifas/${rifaId}/numeros/${numeroId}/${acao}`, { method: 'POST' })
    setLoading(null)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao executar ação.')
    }
  }

  if (status === 'reservado') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {/* Confirmar pagamento */}
        <button
          onClick={() => chamar('confirmar', 'Confirmar pagamento deste número?')}
          disabled={loading !== null}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981',
            opacity: loading !== null ? 0.5 : 1,
          }}>
          {loading === 'confirmar'
            ? <Loader2 size={13} className="animate-spin" />
            : <CheckCircle size={13} />}
          Confirmar
        </button>

        {/* Cancelar reserva */}
        <button
          onClick={() => chamar('cancelar', 'Cancelar esta reserva? O número voltará a ficar disponível.')}
          disabled={loading !== null}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444',
            opacity: loading !== null ? 0.5 : 1,
          }}>
          {loading === 'cancelar'
            ? <Loader2 size={13} className="animate-spin" />
            : <Trash2 size={13} />}
          Cancelar
        </button>
      </div>
    )
  }

  // status === 'pago'
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa',
        padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
        background: 'rgba(124,58,237,0.1)',
      }}>
        <CheckCircle size={13} /> Pago
      </div>

      {/* Reverter pagamento */}
      <button
        onClick={() => chamar('reverter', 'Reverter este pagamento? O número voltará para "reservado".')}
        disabled={loading !== null}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b',
          opacity: loading !== null ? 0.5 : 1,
        }}>
        {loading === 'reverter'
          ? <Loader2 size={13} className="animate-spin" />
          : <RotateCcw size={13} />}
        Reverter
      </button>
    </div>
  )
}
