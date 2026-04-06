// Validação local de CPF (algoritmo oficial)
export function validarCPFLocal(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1+$/.test(clean)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(clean[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(clean[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(clean[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(clean[10])) return false

  return true
}

export function formatarCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatarTelefone(tel: string): string {
  const clean = tel.replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

// Nota: A validação real via Receita Federal requer um serviço intermediário
// pois a API oficial não tem endpoint público direto para CPF.
// Recomenda-se usar Serpro DataValid ou similar em produção.
// Para o MVP, usamos validação local do algoritmo oficial.
export async function validarCPFReceita(cpf: string): Promise<{
  valido: boolean
  nome?: string
  situacao?: string
}> {
  const valido = validarCPFLocal(cpf)
  if (!valido) return { valido: false }

  // Em produção: integrar com Serpro DataValid ou ReceitaWS
  // Por ora retorna validação local
  return { valido: true, situacao: 'REGULAR' }
}
