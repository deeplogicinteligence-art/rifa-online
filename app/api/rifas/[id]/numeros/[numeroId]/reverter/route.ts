import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; numeroId: string }> }
) {
  const { id: rifaId, numeroId } = await params
  const { createClient, createServiceClient } = await import('@/lib/supabase/server')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rifa } = await supabase
    .from('rifas').select('id').eq('id', rifaId).eq('criador_id', user.id).single()
  if (!rifa) return NextResponse.json({ error: 'Rifa não encontrada' }, { status: 404 })

  const serviceClient = await createServiceClient()

  const { data: numero } = await serviceClient
    .from('numeros').select('*').eq('id', numeroId).eq('rifa_id', rifaId).single()
  if (!numero) return NextResponse.json({ error: 'Número não encontrado' }, { status: 404 })
  if (numero.status !== 'pago') return NextResponse.json({ error: 'Número não está pago' }, { status: 400 })

  // Volta para reservado (mantém participante), com nova expiração de 48h
  const expira = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  const { error } = await serviceClient
    .from('numeros')
    .update({ status: 'reservado', pago_em: null, expira_em: expira })
    .eq('id', numeroId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
