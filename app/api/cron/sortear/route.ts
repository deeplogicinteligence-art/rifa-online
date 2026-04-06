import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { createServiceClient } = await import('@/lib/supabase/server')
  const { buscarResultadoLotoFederal, extrairNumeroSorteio } = await import('@/lib/loteria')
  const { enviarEmailResultado } = await import('@/lib/email')
  const { formatarData } = await import('@/lib/utils')

  const supabase = await createServiceClient()
  const hoje = new Date().toISOString().split('T')[0]

  const { data: rifas } = await supabase
    .from('rifas')
    .select('*')
    .eq('data_sorteio', hoje)
    .eq('status', 'ativa')

  if (!rifas?.length) return NextResponse.json({ ok: true, processed: 0 })

  const resultado = await buscarResultadoLotoFederal()
  if (!resultado) return NextResponse.json({ error: 'Resultado da loteria ainda não disponível.' }, { status: 503 })

  let processed = 0

  for (const rifa of rifas) {
    try {
      const { data: numeros } = await supabase
        .from('numeros')
        .select('*, participantes(*)')
        .eq('rifa_id', rifa.id)
        .eq('status', 'pago')

      if (!numeros?.length) {
        await supabase.from('rifas').update({ status: 'encerrada' }).eq('id', rifa.id)
        continue
      }

      const numeroSorteado = extrairNumeroSorteio(resultado, rifa.quantidade_numeros)
      if (!numeroSorteado) continue

      const paidNumbers = numeros.map((n: { numero: number }) => n.numero)
      let ganhadorNumero = numeroSorteado

      if (!paidNumbers.includes(numeroSorteado)) {
        ganhadorNumero = paidNumbers.reduce((prev: number, curr: number) =>
          Math.abs(curr - numeroSorteado) < Math.abs(prev - numeroSorteado) ? curr : prev
        )
      }

      const numeroGanhador = numeros.find((n: { numero: number }) => n.numero === ganhadorNumero)
      const bilhete = resultado.dezenasSorteadasOrdemSorteio[0]

      await supabase.from('rifas').update({
        status: 'sorteada',
        numero_ganhador: ganhadorNumero,
        participante_ganhador_id: numeroGanhador?.participante_id,
        resultado_loteria: `Bilhete ${bilhete} (concurso ${resultado.numero})`,
      }).eq('id', rifa.id)

      for (const n of numeros) {
        try {
          await enviarEmailResultado({
            email: n.participantes.email,
            nome: n.participantes.nome,
            tituloRifa: rifa.titulo,
            numeroGanhador: ganhadorNumero,
            nomeGanhador: numeroGanhador?.participantes?.nome || '',
            eGanhador: n.numero === ganhadorNumero,
            resultadoLoteria: `${bilhete} (concurso ${resultado.numero})`,
            linkRifa: `${process.env.NEXT_PUBLIC_APP_URL}/r/${rifa.slug}`,
          })
        } catch (e) { console.error('Email error:', e) }
      }

      processed++
    } catch (e) {
      console.error(`Erro ao processar rifa ${rifa.id}:`, e)
    }
  }

  return NextResponse.json({ ok: true, processed })
}
