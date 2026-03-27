import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface LeadEmailData {
  nome: string
  email: string
  whatsapp: string
  interesse?: string | null
  created_at: Date
}

export async function sendLeadEmail(lead: LeadEmailData): Promise<void> {
  const r = getResend()

  await r.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@queirozalmeidaconstrutora.com.br',
    to: process.env.EMAIL_TO || 'contato@queirozalmeidaconstrutora.com.br',
    subject: `Novo lead — ${lead.nome}${lead.interesse ? ` — ${lead.interesse}` : ''}`,
    html: `
      <h2>Novo lead recebido</h2>
      <table>
        <tr><td><strong>Nome:</strong></td><td>${lead.nome}</td></tr>
        <tr><td><strong>E-mail:</strong></td><td>${lead.email}</td></tr>
        <tr><td><strong>WhatsApp:</strong></td><td>${lead.whatsapp}</td></tr>
        <tr><td><strong>Interesse:</strong></td><td>${lead.interesse || 'Não informado'}</td></tr>
        <tr><td><strong>Data:</strong></td><td>${lead.created_at.toLocaleString('pt-BR')}</td></tr>
      </table>
    `,
  })
}
