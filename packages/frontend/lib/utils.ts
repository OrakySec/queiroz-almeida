export function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

export function whatsAppLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '')
  const base = `https://wa.me/55${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
