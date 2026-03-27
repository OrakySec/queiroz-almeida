export interface Empreendimento {
  id: string
  nome: string
  slug: string
  descricao?: string
  status: 'RASCUNHO' | 'AGUARDANDO_APROVACAO' | 'PUBLICADO' | 'REJEITADO'
  progresso: number
  localizacao: string
  area_min?: number
  area_max?: number
  quartos?: string
  banheiros?: number
  vagas?: string
  fotos: string[]
  video_url?: string
  is_lancamento: boolean
  created_at: string
}

export interface Lead {
  nome: string
  email: string
  whatsapp: string
  interesse?: string
}

export interface Depoimento {
  id: string
  nome: string
  cidade: string
  texto: string
  foto?: string
  estrelas: number
}
