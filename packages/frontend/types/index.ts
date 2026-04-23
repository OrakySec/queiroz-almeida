export interface Empreendimento {
  id: string
  nome: string
  slug: string
  cidade: string
  estado: string
  bairro?: string
  endereco?: string
  tipo_imovel?: string
  padrao?: string
  descricao_breve?: string
  descricao?: string
  tipologia?: string
  quartos_min?: number
  quartos_max?: number
  suites_min?: number
  suites_max?: number
  banheiros_min?: number
  banheiros_max?: number
  vagas_min?: number
  vagas_max?: number
  vagas_tipo?: string
  num_torres?: number
  num_andares?: number
  latitude?: number
  longitude?: number
  amenidades?: string[]
  status: 'RASCUNHO' | 'AGUARDANDO_APROVACAO' | 'PUBLICADO' | 'REJEITADO'
  progresso: number
  area_min?: number
  area_max?: number
  preco_min?: number
  preco_max?: number
  total_unidades?: number
  unidades_disponiveis?: number
  data_inicio?: string
  data_entrega?: string
  whatsapp?: string
  fotos: string[]
  video_url?: string
  pdf_url?: string
  foto_localizacao?: string
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
