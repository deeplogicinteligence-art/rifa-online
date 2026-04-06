'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopiarLinkBtn({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <button onClick={copiar} className="btn-primary py-2 px-4 text-sm">
      {copiado ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar link</>}
    </button>
  )
}
