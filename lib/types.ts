export type RifaStatus = 'rascunho' | 'ativa' | 'encerrada' | 'cancelada' | 'sorteada'
export type PoliticaIncompleta = 'cancelar' | 'sortear' | 'transferir'
export type NumeroStatus = 'disponivel' | 'reservado' | 'pago'

export interface Profile {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf: string
  cpf_validado: boolean
  created_at: string
}

export interface Rifa {
  id: string
  criador_id: string
  titulo: string
  descricao?: string
  observacoes?: string
  foto_url?: string
  valor_numero: number
  quantidade_numeros: 25 | 50 | 100 | 200 | 500
  chave_pix: string
  data_limite_pagamento: string
  data_sorteio: string
  politica_incompleta: PoliticaIncompleta
  status: RifaStatus
  slug: string
  numero_ganhador?: number
  participante_ganhador_id?: string
  resultado_loteria?: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Participante {
  id: string
  nome: string
  telefone: string
  email: string
  created_at: string
}

export interface Numero {
  id: string
  rifa_id: string
  numero: number
  status: NumeroStatus
  participante_id?: string
  reservado_em?: string
  pago_em?: string
  expira_em?: string
  participantes?: Participante
}

export interface RifaComNumeros extends Rifa {
  numeros: Numero[]
}

export interface ResultadoLoteria {
  data: string
  concurso: number
  premios: {
    ordem: number
    bilhete: string
    valor: number
  }[]
}
