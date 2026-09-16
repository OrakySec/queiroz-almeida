// Código de discagem internacional por país (ISO 3166-1 alpha-2).
// Mantido em espelho com packages/frontend/lib/countries.ts — se adicionar um
// país lá, adicione aqui também.
const DIAL_CODES: Record<string, string> = {
  BR: '55',
  US: '1',
  PT: '351',
  AR: '54',
  UY: '598',
  PY: '595',
  CL: '56',
  CO: '57',
  PE: '51',
  BO: '591',
  MX: '52',
  CA: '1',
  ES: '34',
  FR: '33',
  IT: '39',
  DE: '49',
  GB: '44',
  NL: '31',
  CH: '41',
  BE: '32',
  IE: '353',
  AT: '43',
  SE: '46',
  AO: '244',
  MZ: '258',
  JP: '81',
  CN: '86',
  IL: '972',
  AU: '61',
  ZA: '27',
}

export function getDialCode(pais?: string | null): string {
  if (!pais) return DIAL_CODES.BR
  return DIAL_CODES[pais.toUpperCase()] || DIAL_CODES.BR
}
