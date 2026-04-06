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
  if (numero.status !== 'reservado') return NextResponse.json({ error: 'Número não está reservado' }, { status: 400 })

  const { error } = await serviceClient
    .from('numeros')
    .update({ status: 'disponivel', participante_id: null, reservado_em: null, expira_em: null })
    .eq('id', numeroId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
