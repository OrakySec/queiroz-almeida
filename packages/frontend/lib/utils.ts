// Máscara com DDD só faz sentido pro formato brasileiro. Para os demais
// países, deixamos o campo livre (só dígitos) — os formatos variam demais
// (tamanho, agrupamento) pra valer a pena tentar mascarar todos.
export function formatWhatsApp(value: string, dial: string = '55'): string {
  const digits = value.replace(/\D/g, '')
  if (dial !== '55') return digits
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

export function whatsAppLink(number: string, message?: string, dial: string = '55'): string {
  const digits = number.replace(/\D/g, '')
  const base = `https://wa.me/${dial}${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
