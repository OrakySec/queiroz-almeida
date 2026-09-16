export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  dial: string // código de discagem, sem "+"
  flag: string
}

// Lista curada priorizando os países de onde a Queiroz Almeida mais recebe
// clientes estrangeiros (comunidade lusófona, Mercosul, América do Norte,
// Europa Ocidental). Fácil de estender — só adicionar uma linha.
export const countries: Country[] = [
  { code: 'BR', name: 'Brasil', dial: '55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', dial: '1', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷' },
  { code: 'UY', name: 'Uruguai', dial: '598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', dial: '595', flag: '🇵🇾' },
  { code: 'CL', name: 'Chile', dial: '56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', dial: '57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dial: '51', flag: '🇵🇪' },
  { code: 'BO', name: 'Bolívia', dial: '591', flag: '🇧🇴' },
  { code: 'MX', name: 'México', dial: '52', flag: '🇲🇽' },
  { code: 'CA', name: 'Canadá', dial: '1', flag: '🇨🇦' },
  { code: 'ES', name: 'Espanha', dial: '34', flag: '🇪🇸' },
  { code: 'FR', name: 'França', dial: '33', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', dial: '39', flag: '🇮🇹' },
  { code: 'DE', name: 'Alemanha', dial: '49', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', dial: '44', flag: '🇬🇧' },
  { code: 'NL', name: 'Países Baixos', dial: '31', flag: '🇳🇱' },
  { code: 'CH', name: 'Suíça', dial: '41', flag: '🇨🇭' },
  { code: 'BE', name: 'Bélgica', dial: '32', flag: '🇧🇪' },
  { code: 'IE', name: 'Irlanda', dial: '353', flag: '🇮🇪' },
  { code: 'AT', name: 'Áustria', dial: '43', flag: '🇦🇹' },
  { code: 'SE', name: 'Suécia', dial: '46', flag: '🇸🇪' },
  { code: 'AO', name: 'Angola', dial: '244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique', dial: '258', flag: '🇲🇿' },
  { code: 'JP', name: 'Japão', dial: '81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial: '86', flag: '🇨🇳' },
  { code: 'IL', name: 'Israel', dial: '972', flag: '🇮🇱' },
  { code: 'AU', name: 'Austrália', dial: '61', flag: '🇦🇺' },
  { code: 'ZA', name: 'África do Sul', dial: '27', flag: '🇿🇦' },
]

export function getCountry(code?: string | null): Country {
  return countries.find((c) => c.code === code) ?? countries[0]
}

export function getDialCode(code?: string | null): string {
  return getCountry(code).dial
}
