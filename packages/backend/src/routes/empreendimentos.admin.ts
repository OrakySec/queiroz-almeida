import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import slugify from 'slugify'
import { verifyJWT } from '../middlewares/verifyJWT'
import { requireRole } from '../middlewares/requireRole'
import { uploadFoto, deleteFoto } from '../services/minio.service'
import { prisma } from '../lib/prisma'

const ACCEPTED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp']

const num = z.coerce.number().optional().or(z.literal(''))
const numInt = z.coerce.number().int().optional().or(z.literal(''))

const empreendimentoSchema = z.object({
  nome: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().min(2).max(2),
  bairro: z.string().optional(),
  endereco: z.string().optional(),
  tipoImovel: z.string().optional(),
  padrao: z.string().optional(),
  descricaoBreve: z.string().optional(),
  descricaoCompleta: z.string().optional(),
  tipologia: z.string().optional(),
  quartoMin: numInt,
  quartoMax: numInt,
  suitesMin: numInt,
  suitesMax: numInt,
  banheirosMin: numInt,
  banheirosMax: numInt,
  vagasMin: numInt,
  vagasMax: numInt,
  vagasTipo: z.string().optional(),
  numTorres: numInt,
  numAndares: numInt,
  latitude: num,
  longitude: num,
  amenidades: z.array(z.string()).optional(),
  areaMin: num,
  areaMax: num,
  precoMin: num,
  precoMax: num,
  totalUnidades: numInt,
  unidadesDisponiveis: numInt,
  percentualObra: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  dataEntrega: z.string().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  destaque: z.boolean().default(false),
})

function toInt(v: unknown) { const n = Number(v); return (v !== '' && v != null && !isNaN(n)) ? n : null }
function toNum(v: unknown) { const n = Number(v); return (v !== '' && v != null && !isNaN(n)) ? n : null }

function toDbData(data: z.infer<typeof empreendimentoSchema>) {
  return {
    nome: data.nome,
    cidade: data.cidade,
    estado: data.estado,
    bairro: data.bairro || null,
    endereco: data.endereco || null,
    tipo_imovel: data.tipoImovel || null,
    padrao: data.padrao || null,
    descricao_breve: data.descricaoBreve || null,
    descricao: data.descricaoCompleta || null,
    tipologia: data.tipologia || null,
    quartos_min: toInt(data.quartoMin),
    quartos_max: toInt(data.quartoMax),
    suites_min: toInt(data.suitesMin),
    suites_max: toInt(data.suitesMax),
    banheiros_min: toInt(data.banheirosMin),
    banheiros_max: toInt(data.banheirosMax),
    vagas_min: toInt(data.vagasMin),
    vagas_max: toInt(data.vagasMax),
    vagas_tipo: data.vagasTipo || null,
    num_torres: toInt(data.numTorres),
    num_andares: toInt(data.numAndares),
    latitude: toNum(data.latitude),
    longitude: toNum(data.longitude),
    amenidades: data.amenidades ?? [],
    progresso: Number(data.percentualObra ?? 0),
    area_min: toNum(data.areaMin),
    area_max: toNum(data.areaMax),
    preco_min: toNum(data.precoMin),
    preco_max: toNum(data.precoMax),
    total_unidades: toInt(data.totalUnidades),
    unidades_disponiveis: toInt(data.unidadesDisponiveis),
    data_entrega: data.dataEntrega ? new Date(data.dataEntrega) : null,
    video_url: data.videoUrl || null,
    whatsapp: data.whatsapp || null,
    is_lancamento: data.destaque ?? false,
  }
}

export async function empreendimentosAdminRoutes(app: FastifyInstance) {
  const preHandler = [verifyJWT]

  // GET /api/admin/empreendimentos
  app.get('/', { preHandler }, async (request, reply) => {
    const { status, q } = request.query as { status?: string; q?: string }

    const empreendimentos = await prisma.empreendimento.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(q ? { nome: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: {
        created_by: { select: { nome: true, email: true } },
        approved_by: { select: { nome: true, email: true } },
      },
      orderBy: { updated_at: 'desc' },
    })
    return reply.send(empreendimentos)
  })

  // POST /api/admin/empreendimentos
  app.post('/', { preHandler }, async (request, reply) => {
    const user = request.user as { id: string }
    const data = empreendimentoSchema.parse(request.body)
    const slug = slugify(data.nome, { lower: true, strict: true, locale: 'pt' })

    if (data.destaque) {
      await prisma.empreendimento.updateMany({
        where: { is_lancamento: true },
        data: { is_lancamento: false },
      })
    }

    const empreendimento = await prisma.empreendimento.create({
      data: { ...toDbData(data), slug, created_by_id: user.id, status: 'RASCUNHO' },
    })
    return reply.status(201).send(empreendimento)
  })

  // GET /api/admin/empreendimentos/:id
  app.get('/:id', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const empreendimento = await prisma.empreendimento.findUnique({
      where: { id },
      include: {
        created_by: { select: { nome: true, email: true } },
        approved_by: { select: { nome: true, email: true } },
      },
    })
    if (!empreendimento) return reply.status(404).send({ message: 'Empreendimento não encontrado.' })
    return reply.send(empreendimento)
  })

  // PUT /api/admin/empreendimentos/:id
  app.put('/:id', { preHandler }, async (request, reply) => {
    const user = request.user as { id: string; role: string }
    const { id } = request.params as { id: string }
    const data = empreendimentoSchema.parse(request.body)

    const existing = await prisma.empreendimento.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ message: 'Empreendimento não encontrado.' })

    if (user.role === 'EDITOR' && !['RASCUNHO', 'REJEITADO'].includes(existing.status)) {
      return reply.status(403).send({ message: 'Você não pode editar este empreendimento no status atual.' })
    }

    const novoStatus = existing.status === 'REJEITADO' ? 'RASCUNHO' : existing.status

    if (data.destaque) {
      await prisma.empreendimento.updateMany({
        where: { is_lancamento: true, id: { not: id } },
        data: { is_lancamento: false },
      })
    }

    const updated = await prisma.empreendimento.update({
      where: { id },
      data: {
        ...toDbData(data),
        status: novoStatus,
        ...(novoStatus === 'RASCUNHO' && existing.status === 'REJEITADO' ? { rejection_comment: null } : {}),
      },
    })
    return reply.send(updated)
  })

  // PATCH /api/admin/empreendimentos/:id/status
  app.patch(
    '/:id/status',
    { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] },
    async (request, reply) => {
      const user = request.user as { id: string }
      const { id } = request.params as { id: string }
      const { status } = z.object({
        status: z.enum(['RASCUNHO', 'AGUARDANDO_APROVACAO', 'PUBLICADO', 'REJEITADO']),
      }).parse(request.body)

      const data: any = { status }
      if (status === 'PUBLICADO') data.approved_by_id = user.id
      if (status === 'PUBLICADO' || status === 'RASCUNHO') data.rejection_comment = null

      const updated = await prisma.empreendimento.update({ where: { id }, data })
      return reply.send(updated)
    }
  )

  // DELETE /api/admin/empreendimentos/:id
  app.delete('/:id', { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.empreendimento.delete({ where: { id } })
    return reply.status(204).send()
  })

  // POST /api/admin/empreendimentos/:id/submeter
  app.post('/:id/submeter', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.empreendimento.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ message: 'Empreendimento não encontrado.' })
    if (!['RASCUNHO', 'REJEITADO'].includes(existing.status)) {
      return reply.status(400).send({ message: 'Apenas rascunhos ou rejeitados podem ser submetidos.' })
    }
    const updated = await prisma.empreendimento.update({
      where: { id },
      data: { status: 'AGUARDANDO_APROVACAO', rejection_comment: null },
    })
    return reply.send(updated)
  })

  // POST /api/admin/empreendimentos/:id/aprovar
  app.post('/:id/aprovar', { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] }, async (request, reply) => {
    const user = request.user as { id: string }
    const { id } = request.params as { id: string }
    const updated = await prisma.empreendimento.update({
      where: { id },
      data: { status: 'PUBLICADO', approved_by_id: user.id, rejection_comment: null },
    })
    return reply.send(updated)
  })

  // POST /api/admin/empreendimentos/:id/rejeitar
  app.post('/:id/rejeitar', { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] }, async (request, reply) => {
    const { comentario } = z.object({ comentario: z.string().min(1) }).parse(request.body)
    const { id } = request.params as { id: string }
    const updated = await prisma.empreendimento.update({
      where: { id },
      data: { status: 'REJEITADO', rejection_comment: comentario },
    })
    return reply.send(updated)
  })

  // POST /api/admin/empreendimentos/:id/fotos
  app.post('/:id/fotos', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.empreendimento.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ message: 'Empreendimento não encontrado.' })

    const fotosAtual = (existing.fotos as string[]) || []
    if (fotosAtual.length >= 20) {
      return reply.status(400).send({ message: 'Limite de 20 fotos atingido.' })
    }

    const parts = request.files()
    const novasUrls: string[] = []

    for await (const part of parts) {
      if (!ACCEPTED_MIMETYPES.includes(part.mimetype)) {
        return reply.status(400).send({ message: `Formato não aceito: ${part.mimetype}` })
      }
      const buffer = await part.toBuffer()
      const url = await uploadFoto(id, part.filename, buffer, part.mimetype)
      novasUrls.push(url)
    }

    const updated = await prisma.empreendimento.update({
      where: { id },
      data: { fotos: [...fotosAtual, ...novasUrls] },
    })
    return reply.send(updated)
  })

  // DELETE /api/admin/empreendimentos/:id/fotos
  app.delete('/:id/fotos', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { url } = z.object({ url: z.string().url() }).parse(request.body)

    const existing = await prisma.empreendimento.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ message: 'Empreendimento não encontrado.' })

    await deleteFoto(url)
    const fotos = ((existing.fotos as string[]) || []).filter((f) => f !== url)
    const updated = await prisma.empreendimento.update({ where: { id }, data: { fotos } })
    return reply.send(updated)
  })
}
