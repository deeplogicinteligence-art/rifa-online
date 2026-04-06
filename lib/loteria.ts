export interface ResultadoLotoFederal {
  acumulado: boolean
  dataApuracao: string
  dataProximoConcurso: string
  dezenasSorteadasOrdemSorteio: string[]
  exibirDetalhamentoPorCidade: boolean
  id: string | null
  indicadorConcursoEspecial: number
  listaDesorteios: unknown[]
  listaMunicipioUFGanhadores: unknown[]
  listaRateioPremio: {
    descricaoFaixa: string
    faixaGanhadores: number
    numeroDeGanhadores: number
    valorPremio: number
  }[]
  listaResultadoEquipeEsportiva: unknown[]
  localSorteio: string
  nomeMunicipioUFSorteio: string
  nomeTimeCoracaoMesSorte: string | null
  numero: number
  numeroConcursoAnterior: number
  numeroConcursoFinal_0_5: number
  numeroConcursoProximo: number
  numeroJogosSimples: number
  premiacaoContingencia: unknown | null
  tipoJogo: string
  tipoPublicacao: number
  ultimoConcurso: boolean
  valorArrecadado: number
  valorEstimadoProximoConcurso: number
  valorSaldoReservaGarantidora: number
  valorTotalPremioFaixaUm: number
}

export async function buscarResultadoLotoFederal(concurso?: number): Promise<ResultadoLotoFederal | null> {
  try {
    const url = concurso
      ? `https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/${concurso}`
      : `https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/`

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data
  } catch {
    return null
  }
}

// Extrai o último número do bilhete do 1º prêmio
export function extrairNumeroSorteio(resultado: ResultadoLotoFederal, quantidadeNumeros: number): number | null {
  const bilhetes = resultado.dezenasSorteadasOrdemSorteio
  if (!bilhetes || bilhetes.length === 0) return null

  // Primeiro prêmio é o primeiro bilhete (5 dígitos)
  const primeiroPremio = bilhetes[0]
  const ultimosDois = parseInt(primeiroPremio.slice(-2))

  // Mapeia para o range da rifa
  const numero = (ultimosDois % quantidadeNumeros) + 1
  return numero
}

export function proximaDataLoteria(): Date {
  const hoje = new Date()
  const diaSemana = hoje.getDay() // 0=dom, 3=qua, 6=sab

  const diasParaQuarta = (3 - diaSemana + 7) % 7 || 7
  const diasParaSabado = (6 - diaSemana + 7) % 7 || 7

  const proximaData = Math.min(diasParaQuarta, diasParaSabado)
  const data = new Date(hoje)
  data.setDate(hoje.getDate() + proximaData)
  return data
}

export function isDiaLoteria(data: Date): boolean {
  const dia = data.getDay()
  return dia === 3 || dia === 6 // quarta ou sábado
}
