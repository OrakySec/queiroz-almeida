export interface Empreendimento {
  id: string
  nome: string
  slug: string
  cidade: string
  estado: string
  descricao_breve?: string
  descricao?: string
  tipologia?: string
  status: 'RASCUNHO' | 'AGUARDANDO_APROVACAO' | 'PUBLICADO' | 'REJEITADO'
  progresso: number
  area_min?: number
  area_max?: number
  preco_min?: number
  preco_max?: number
  total_unidades?: number
  unidades_disponiveis?: number
  data_entrega?: string
  whatsapp?: string
  fotos: string[]
  video_url?: string
  is_lancamento: boolean
  created_at: string
  updated_at: string
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
