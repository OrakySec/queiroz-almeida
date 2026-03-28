import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

const SELECT_PUBLIC = {
  id: true,
  nome: true,
  slug: true,
  descricao: true,
  progresso: true,
  localizacao: true,
  area_min: true,
  area_max: true,
  quartos: true,
  banheiros: true,
  vagas: true,
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
