'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function ConfirmarPagamentoBtn({ numeroId, rifaId }: { numeroId: string; rifaId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function confirmar() {
    if (!confirm('Confirmar pagamento deste número?')) return
    setLoading(true)
    const res = await fetch(`/api/rifas/${rifaId}/numeros/${numeroId}/confirmar`, { method: 'POST' })
    setLoading(false)
    if (res.ok) router.refresh()
    else alert('Erro ao confirmar. Tente novamente.')
  }

  return (
    <button onClick={confirmar} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      {loading ? 'Confirmando...' : 'Confirmar pagamento'}
    </button>
  )
}
