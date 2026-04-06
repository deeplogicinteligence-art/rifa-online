'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Calendar, Hash, DollarSign, Key, FileText, Info, ArrowRight, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { gerarSlug } from '@/lib/utils'
import { isDiaLoteria } from '@/lib/loteria'

const QUANTIDADES = [25, 50, 100, 200, 500]
const POLITICAS = [
  { value: 'cancelar', label: 'Cancelar e devolver pagamentos', desc: 'A rifa é cancelada e você devolve quem pagou' },
  { value: 'sortear', label: 'Sortear com os números vendidos', desc: 'O sorteio acontece mesmo incompleto' },
  { value: 'transferir', label: 'Transferir para nova data', desc: 'A data do sorteio é adiada' },
]

export default function NovaRifaPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    titulo: '', descricao: '', observacoes: '', valor_numero: '',
    quantidade_numeros: 100, chave_pix: '',
    data_limite_pagamento: '', data_sorteio: '',
    politica_incompleta: 'sortear',
  })

  function set(campo: string, valor: string | number) {
    setForm(f => ({ ...f, [campo]: valor })); setErro('')
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErro('A foto deve ter no máximo 5MB.'); return }
    setFotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setFotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErro('')
    if (!form.titulo.trim()) return setErro('Informe o título da rifa.')
    if (!form.valor_numero || Number(form.valor_numero) <= 0) return setErro('Informe o valor por número.')
    if (!form.chave_pix.trim()) return setErro('Informe a chave Pix.')
    if (!form.data_limite_pagamento) return setErro('Informe a data limite de pagamento.')
    if (!form.data_sorteio) return setErro('Informe a data do sorteio.')
    if (!isDiaLoteria(new Date(form.data_sorteio + 'T00:00:00'))) return setErro('A data do sorteio deve ser uma quarta-feira ou sábado (dias da Loteria Federal).')
    if (form.data_sorteio <= form.data_limite_pagamento) return setErro('A data do sorteio deve ser após a data limite de pagamento.')
    setCarregando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    let foto_url = null
    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('rifas').upload(path, fotoFile)
      if (uploadError) { setErro('Erro ao fazer upload da foto.'); setCarregando(false); return }
      const { data: urlData } = supabase.storage.from('rifas').getPublicUrl(path)
      foto_url = urlData.publicUrl
    }
    const slug = gerarSlug(form.titulo)
    const { data, error } = await supabase.from('rifas').insert({
      criador_id: user.id, titulo: form.titulo,
      descricao: form.descricao || null, observacoes: form.observacoes || null,
      foto_url, valor_numero: Number(form.valor_numero),
      quantidade_numeros: form.quantidade_numeros, chave_pix: form.chave_pix,
      data_limite_pagamento: form.data_limite_pagamento, data_sorteio: form.data_sorteio,
      politica_incompleta: form.politica_incompleta, slug, status: 'ativa',
    }).select().single()
    if (error) { setErro('Erro ao criar rifa. Tente novamente.'); setCarregando(false); return }
    router.push(`/dashboard/rifas/${data.id}`)
  }

  const section = (title: string, children: React.ReactNode) => (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h2 style={{ fontSize: '1.0625rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1.25rem' }}>{title}</h2>
      {children}
    </div>
  )

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Nova rifa</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure os detalhes da sua rifa</p>
      </div>

      {erro && <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{erro}</div>}

      <form onSubmit={handleSubmit}>
        {/* Foto */}
        {section('Foto do produto',
          fotoPreview ? (
            <div style={{ position: 'relative' }}>
              <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '0.75rem' }} />
              <button type="button" onClick={() => { setFotoPreview(null); setFotoFile(null) }}
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', color: 'white' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, borderRadius: '0.75rem', cursor: 'pointer', border: '2px dashed var(--border)', background: 'var(--surface-2)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <Upload style={{ width: 36, height: 36, marginBottom: '0.75rem', color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Clique para adicionar foto</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG até 5MB</span>
              <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
            </label>
          )
        )}

        {/* Info */}
        {section('Informações da rifa',
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Título</label>
              <input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ex: iPhone 15 Pro, Moto G84..." className="input" maxLength={80} required />
            </div>
            <div>
              <label className="label">Descrição <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
              <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descreva o produto com mais detalhes..." className="input" style={{ height: 88, resize: 'none' }} maxLength={500} />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText style={{ width: 13, height: 13 }} /> Observações <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(frete, retirada, etc.)</span>
              </label>
              <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Ex: Produto com frete grátis. Retirada disponível em SP." className="input" style={{ height: 72, resize: 'none' }} maxLength={300} />
            </div>
          </div>
        )}

        {/* Config */}
        {section('Configurações',
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><DollarSign style={{ width: 13, height: 13 }} /> Valor por número (R$)</label>
                <input type="number" value={form.valor_numero} onChange={e => set('valor_numero', e.target.value)} placeholder="10,00" className="input" min="1" step="0.01" required />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Key style={{ width: 13, height: 13 }} /> Chave Pix</label>
                <input type="text" value={form.chave_pix} onChange={e => set('chave_pix', e.target.value)} placeholder="CPF, e-mail ou aleatória" className="input" required />
              </div>
            </div>

            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Hash style={{ width: 13, height: 13 }} /> Quantidade de números</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '0.375rem' }}>
                {QUANTIDADES.map(q => (
                  <button key={q} type="button" onClick={() => set('quantidade_numeros', q)}
                    style={{
                      padding: '0.625rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem',
                      fontFamily: 'Syne, sans-serif', cursor: 'pointer', transition: 'all 0.15s',
                      background: form.quantidade_numeros === q ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'var(--surface-2)',
                      border: form.quantidade_numeros === q ? 'none' : '1px solid var(--border)',
                      color: form.quantidade_numeros === q ? 'white' : 'var(--text-muted)',
                      boxShadow: form.quantidade_numeros === q ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                    }}>
                    {q}
                  </button>
                ))}
              </div>
              {form.valor_numero && (
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                  Total potencial: <strong style={{ color: 'var(--accent-light)' }}>R$ {(Number(form.valor_numero) * form.quantidade_numeros).toFixed(2).replace('.', ',')}</strong>
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar style={{ width: 13, height: 13 }} /> Limite de pagamento</label>
                <input type="date" value={form.data_limite_pagamento} onChange={e => set('data_limite_pagamento', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} className="input" required />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar style={{ width: 13, height: 13 }} /> Data do sorteio</label>
                <input type="date" value={form.data_sorteio} onChange={e => set('data_sorteio', e.target.value)}
                  min={form.data_limite_pagamento || new Date().toISOString().split('T')[0]} className="input" required />
                <p style={{ fontSize: '0.75rem', marginTop: '0.375rem', color: 'var(--text-muted)' }}>⚡ Quarta ou sábado (Loteria Federal)</p>
              </div>
            </div>
          </div>
        )}

        {/* Política */}
        {section('Se não preencher todos os números',
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Esta política ficará visível para todos os participantes.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {POLITICAS.map(p => (
                <button key={p.value} type="button" onClick={() => set('politica_incompleta', p.value)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.875rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                    background: form.politica_incompleta === p.value ? 'rgba(124,58,237,0.1)' : 'var(--surface-2)',
                    border: form.politica_incompleta === p.value ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid', borderColor: form.politica_incompleta === p.value ? 'var(--accent)' : 'var(--border-light)' }}>
                      {form.politica_incompleta === p.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <div style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: '1.5rem' }}>
          <Info style={{ width: 16, height: 16, flexShrink: 0, marginTop: '0.125rem', color: 'var(--accent-light)' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Após criar, você receberá um link único para compartilhar. O sorteio será realizado automaticamente com base no resultado da Loteria Federal.
          </p>
        </div>

        <button type="submit" disabled={carregando} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
          {carregando
            ? <><Loader2 style={{ width: 20, height: 20 }} className="animate-spin" /> Criando rifa...</>
            : <>Criar rifa e gerar link <ArrowRight style={{ width: 20, height: 20 }} /></>}
        </button>
      </form>
    </div>
  )
}
