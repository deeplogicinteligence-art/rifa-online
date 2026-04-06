import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Rifa Online <noreply@seudominio.com.br>'

export async function enviarEmailConfirmacaoReserva(params: {
  email: string
  nome: string
  numeroRifa: number
  tituloRifa: string
  valorNumero: number
  chavePix: string
  dataLimite: string
  linkRifa: string
}) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `✅ Número ${params.numeroRifa} reservado — ${params.tituloRifa}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px;">Olá, ${params.nome}! 🎟️</h1>
        <p>Seu número <strong>#${params.numeroRifa}</strong> foi reservado com sucesso na rifa <strong>${params.tituloRifa}</strong>.</p>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h2 style="margin: 0 0 16px; color: #1a1a2e;">Como pagar</h2>
          <p style="margin: 0 0 8px;">Faça um Pix para a chave abaixo:</p>
          <div style="background: #fff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 18px; font-weight: bold; text-align: center; letter-spacing: 1px;">
            ${params.chavePix}
          </div>
          <p style="margin: 12px 0 0; color: #ef4444; font-weight: 600;">
            ⚠️ Pague até ${params.dataLimite} — após este prazo seu número será liberado.
          </p>
          <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
            Valor: <strong>R$ ${params.valorNumero.toFixed(2)}</strong>
          </p>
        </div>

        <p>Após o pagamento, o organizador irá confirmar seu número na plataforma.</p>
        
        <a href="${params.linkRifa}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ver rifa
        </a>
      </div>
    `,
  })
}

export async function enviarEmailConfirmacaoPagamento(params: {
  email: string
  nome: string
  numeroRifa: number
  tituloRifa: string
  dataSorteio: string
  linkRifa: string
}) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `🎉 Pagamento confirmado — ${params.tituloRifa}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px;">Pagamento confirmado! 🎉</h1>
        <p>Olá, <strong>${params.nome}</strong>!</p>
        <p>Seu pagamento foi confirmado. O número <strong>#${params.numeroRifa}</strong> da rifa <strong>${params.tituloRifa}</strong> é oficialmente seu!</p>
        
        <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 18px; color: #166534;">
            🗓️ Sorteio: <strong>${params.dataSorteio}</strong>
          </p>
          <p style="margin: 8px 0 0; color: #166534; font-size: 14px;">
            O resultado será baseado na Loteria Federal. Boa sorte!
          </p>
        </div>

        <a href="${params.linkRifa}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ver rifa
        </a>
      </div>
    `,
  })
}

export async function enviarEmailResultado(params: {
  email: string
  nome: string
  tituloRifa: string
  numeroGanhador: number
  nomeGanhador: string
  eGanhador: boolean
  resultadoLoteria: string
  linkRifa: string
}) {
  const assunto = params.eGanhador
    ? `🏆 VOCÊ GANHOU! — ${params.tituloRifa}`
    : `📋 Resultado do sorteio — ${params.tituloRifa}`

  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: assunto,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        ${params.eGanhador
          ? `<h1 style="color: #f59e0b; font-size: 28px;">🏆 PARABÉNS, ${params.nome.toUpperCase()}!</h1>
             <p style="font-size: 18px;">Você ganhou a rifa <strong>${params.tituloRifa}</strong>!</p>`
          : `<h1 style="color: #1a1a2e; font-size: 24px;">Resultado do sorteio</h1>
             <p>Olá, <strong>${params.nome}</strong>. O sorteio da rifa <strong>${params.tituloRifa}</strong> foi realizado.</p>`
        }
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #6b7280;">Resultado Loteria Federal: <strong>${params.resultadoLoteria}</strong></p>
          <p style="margin: 0 0 8px; font-size: 20px;">🎟️ Número sorteado: <strong>#${params.numeroGanhador}</strong></p>
          <p style="margin: 0;">🏆 Ganhador: <strong>${params.nomeGanhador}</strong></p>
        </div>

        <a href="${params.linkRifa}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ver resultado
        </a>
      </div>
    `,
  })
}
