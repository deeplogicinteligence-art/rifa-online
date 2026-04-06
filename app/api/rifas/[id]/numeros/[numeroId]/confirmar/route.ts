import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; numeroId: string }> }
) {
  const { id: rifaId, numeroId } = await params
  const { createClient, createServiceClient } = await import('@/lib/supabase/server')
  const { enviarEmailConfirmacaoPagamento } = await import('@/lib/email')
  const { formatarData } = await import('@/lib/utils')

  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rifa } = await supabase
    .from('rifas').select('*').eq('id', rifaId).eq('criador_id', user.id).single()
  if (!rifa) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: numero } = await serviceClient
    .from('numeros').select('*, participantes(*)').eq('id', numeroId).eq('rifa_id', rifaId).single()
  if (!numero || numero.status !== 'reservado') return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  await serviceClient.from('numeros').update({
    status: 'pago',
    pago_em: new Date().toISOString(),
  }).eq('id', numeroId)

  try {
    await enviarEmailConfirmacaoPagamento({
      email: numero.participantes.email,
      nome: numero.participantes.nome,
      numeroRifa: numero.numero,
      tituloRifa: rifa.titulo,
      dataSorteio: formatarData(rifa.data_sorteio),
      linkRifa: `${process.env.NEXT_PUBLIC_APP_URL}/r/${rifa.slug}`,
    })
  } catch (e) { console.error('Email error:', e) }

  return NextResponse.json({ ok: true })
}
