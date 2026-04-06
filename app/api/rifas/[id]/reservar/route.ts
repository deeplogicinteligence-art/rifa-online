import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rifaId } = await params
  const body = await req.json()
  const { numeros, nome, email, telefone } = body

  if (!numeros?.length || !nome || !email || !telefone) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  const { createClient } = await import('@/lib/supabase/server')

  // Use anon client for reading rifa (public) but service role for writes
  const supabase = await createClient()

  // Get rifa info
  const { data: rifa, error: rifaError } = await supabase
    .from('rifas').select('*').eq('id', rifaId).eq('status', 'ativa').single()

  if (rifaError || !rifa) {
    console.error('Rifa error:', rifaError)
    return NextResponse.json({ error: 'Rifa não encontrada ou encerrada.' }, { status: 404 })
  }

  // Check number availability
  const { data: numerosDb, error: numError } = await supabase
    .from('numeros').select('*').eq('rifa_id', rifaId).in('numero', numeros)

  if (numError) {
    console.error('Numeros error:', numError)
    return NextResponse.json({ error: 'Erro ao verificar números.' }, { status: 500 })
  }

  const indisponiveis = numerosDb?.filter(n => n.status !== 'disponivel') || []
  if (indisponiveis.length > 0) {
    return NextResponse.json({
      error: `Número(s) ${indisponiveis.map((n: { numero: number }) => n.numero).join(', ')} não estão mais disponíveis.`
    }, { status: 409 })
  }

  // Use service role for all writes to bypass RLS
  const { createServiceClient } = await import('@/lib/supabase/server')
  const serviceClient = await createServiceClient()

  // Insert participante
  const { data: participante, error: pError } = await serviceClient
    .from('participantes')
    .insert({ nome, email, telefone: telefone.replace(/\D/g, '') })
    .select()
    .single()

  if (pError || !participante) {
    console.error('Participante insert error:', JSON.stringify(pError))
    return NextResponse.json({
      error: `Erro ao salvar participante: ${pError?.message || 'desconhecido'}`
    }, { status: 500 })
  }

  // Reserve numbers
  const expira = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  const { error: nError } = await serviceClient
    .from('numeros')
    .update({
      status: 'reservado',
      participante_id: participante.id,
      reservado_em: new Date().toISOString(),
      expira_em: expira,
    })
    .eq('rifa_id', rifaId)
    .in('numero', numeros)

  if (nError) {
    console.error('Numeros update error:', JSON.stringify(nError))
    return NextResponse.json({ error: 'Erro ao reservar números.' }, { status: 500 })
  }

  // Send emails (non-blocking)
  try {
    const { enviarEmailConfirmacaoReserva } = await import('@/lib/email')
    const { formatarData } = await import('@/lib/utils')
    for (const num of numeros) {
      await enviarEmailConfirmacaoReserva({
        email, nome, numeroRifa: num,
        tituloRifa: rifa.titulo,
        valorNumero: Number(rifa.valor_numero),
        chavePix: rifa.chave_pix,
        dataLimite: formatarData(rifa.data_limite_pagamento),
        linkRifa: `${process.env.NEXT_PUBLIC_APP_URL}/r/${rifa.slug}`,
      })
    }
  } catch (e) {
    console.error('Email error (non-blocking):', e)
  }

  return NextResponse.json({ ok: true, participanteId: participante.id })
}
