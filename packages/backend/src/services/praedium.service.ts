/**
 * Integração com o Webhook de Entrada da Central de Conexões do Praedium CRM.
 *
 * Docs: https://documenter.getpostman.com/view/10054998/2sB3dSP8FJ
 *
 * A URL completa (com access_token) é gerada pelo painel do Praedium ao criar
 * a conexão — copie e cole exatamente como fornecida em PRAEDIUM_WEBHOOK_URL.
 * Formato esperado: https://api.praedium.com.br/v1/{conta}/{conexao}/conversion?access_token={chave}
 */

interface LeadPraediumData {
  nome: string
  email: string
  whatsapp: string
  interesse?: string | null
  origem?: string | null
  tipo_usuario?: string | null
  tipo_corretor?: string | null
  imobiliaria?: string | null
}

const TIMEOUT_MS = 8000
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Envia o lead para o Praedium. Falhas são logadas mas nunca lançadas para
 * quem chamou — a integração com o CRM não pode derrubar o cadastro do lead
 * no nosso banco nem o e-mail de notificação.
 */
export async function sendLeadToPraedium(lead: LeadPraediumData): Promise<void> {
  const webhookUrl = process.env.PRAEDIUM_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('PRAEDIUM_WEBHOOK_URL não configurada — lead não foi enviado ao Praedium.')
    return
  }

  // Campos padrão reconhecidos automaticamente pelo Praedium.
  // Campos extras (interesse, origem, tipo_usuario, tipo_corretor, imobiliaria)
  // NÃO são campos padrão do Praedium — não mapeamos "interesse" para
  // property_code de propósito, pois isso só funcionaria se os empreendimentos
  // do site estivessem cadastrados no Praedium com o mesmo código, o que não
  // é garantido. Eles chegam como chaves extras no payload; para gravá-los em
  // campos personalizados do CRM, crie os campos no Praedium e mapeie-os em
  // Central de Conexões > (sua conexão) > Mapeamento de Campos.
  const payload = {
    name: lead.nome,
    primary_email: lead.email,
    first_phone: lead.whatsapp,
    lead_stage: 'lead',
    interesse: lead.interesse || undefined,
    origem: lead.origem || undefined,
    tipo_usuario: lead.tipo_usuario || undefined,
    tipo_corretor: lead.tipo_corretor || undefined,
    imobiliaria: lead.imobiliaria || undefined,
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (res.ok) return // 200/201 — sucesso

      const body = await res.text().catch(() => '')

      // Erros de autenticação/limite/config não se resolvem tentando de novo
      // com o mesmo payload — loga e desiste.
      if ([401, 403, 422].includes(res.status)) {
        console.error(`Praedium rejeitou o lead (HTTP ${res.status}):`, body)
        return
      }

      // 429 (rate limit / cota) e 5xx podem se resolver com retry.
      console.warn(`Praedium respondeu HTTP ${res.status} (tentativa ${attempt}/${MAX_ATTEMPTS}):`, body)
    } catch (err) {
      clearTimeout(timeout)
      console.warn(`Falha ao chamar o webhook do Praedium (tentativa ${attempt}/${MAX_ATTEMPTS}):`, err)
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS * attempt)
    }
  }

  console.error('Não foi possível enviar o lead ao Praedium após todas as tentativas:', lead.email)
}
