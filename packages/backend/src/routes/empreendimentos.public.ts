import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

const SELECT_PUBLIC = {
  id: true,
  nome: true,
  slug: true,
  cidade: true,
  estado: true,
  bairro: true,
  endereco: true,
  tipo_imovel: true,
  padrao: true,
  descricao_breve: true,
  descricao: true,
  tipologia: true,
  quartos_min: true,
  quartos_max: true,
  suites_min: true,
  suites_max: true,
  banheiros_min: true,
  banheiros_max: true,
  vagas_min: true,
  vagas_max: true,
  vagas_tipo: true,
  num_torres: true,
  num_andares: true,
  latitude: true,
  longitude: true,
  amenidades: true,
  progresso: true,
  area_min: true,
  area_max: true,
  preco_min: true,
  preco_max: true,
  total_unidades: true,
  unidades_disponiveis: true,
  data_inicio: true,
  data_entrega: true,
  whatsapp: true,
  fotos: true,
  video_url: true,
  is_lancamento: true,
  created_at: true,
}

export async function empreendimentosPublicRoutes(app: FastifyInstance) {
  // GET /api/empreendimentos — lista publicados
  app.get('/', async (_request, reply) => {
    const empreendimentos = await prisma.empreendimento.findMany({
      where: { status: 'PUBLICADO' },
      select: SELECT_PUBLIC,
      orderBy: { created_at: 'desc' },
    })
    return reply.send(empreendimentos)
  })

  // GET /api/empreendimentos/lancamento — destaque da home
  app.get('/lancamento', async (_request, reply) => {
    let empreendimento = await prisma.empreendimento.findFirst({
      where: { status: 'PUBLICADO', is_lancamento: true },
      select: SELECT_PUBLIC,
    })

    if (!empreendimento) {
      empreendimento = await prisma.empreendimento.findFirst({
        where: { status: 'PUBLICADO' },
        select: SELECT_PUBLIC,
        orderBy: { created_at: 'desc' },
      })
    }

    if (!empreendimento) return reply.status(404).send({ message: 'Nenhum empreendimento publicado.' })
    return reply.send(empreendimento)
  })

  // GET /api/empreendimentos/:slug — detalhe
  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { slug, status: 'PUBLICADO' },
      select: SELECT_PUBLIC,
    })

    if (!empreendimento) return reply.status(404).send({ message: 'Empreendimento não encontrado.' })
    return reply.send(empreendimento)
  })
}
