export function gerarSlug(titulo: string): string {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)

  const sufixo = Math.random().toString(36).slice(2, 7)
  return `${base}-${sufixo}`
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: string): string {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function politicaLabel(politica: string): string {
  const labels: Record<string, string> = {
    cancelar: 'Cancelar e devolver pagamentos',
    sortear: 'Sortear com os números vendidos',
    transferir: 'Transferir para nova data',
  }
  return labels[politica] || politica
}
