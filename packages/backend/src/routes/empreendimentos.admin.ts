import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import slugify from 'slugify'
import { verifyJWT } from '../middlewares/verifyJWT'
import { requireRole } from '../middlewares/requireRole'
import { uploadFoto, deleteFoto } from '../services/minio.service'
import { prisma } from '../lib/prisma'

const ACCEPTED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp']

const empreendimentoSchema = z.object({
  nome: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().min(2).max(2),
  descricaoBreve: z.string().optional(),
  descricaoCompleta: z.string().optional(),
  tipologia: z.string().optional(),
  areaMin: z.coerce.number().optional().or(z.literal('')),
  areaMax: z.coerce.number().optional().or(z.literal('')),
  precoMin: z.coerce.number().optional().or(z.literal('')),
  precoMax: z.coerce.number().optional().or(z.literal('')),
  totalUnidades: z.coerce.number().int().optional().or(z.literal('')),
  unidadesDisponiveis: z.coerce.number().int().optional().or(z.literal('')),
  percentualObra: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  dataEntrega: z.string().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  destaque: z.boolean().default(false),
})

function toDbData(data: z.infer<typeof empreendimentoSchema>) {
  return {
    nome: data.nome,
    cidade: data.cidade,
    estado: data.estado,
    descricao_breve: data.descricaoBreve || null,
    descricao: data.descricaoCompleta || null,
    tipologia: data.tipologia || null,
    progresso: Number(data.percentualObra ?? 0),
    area_min: data.areaMin !== '' && data.areaMin != null ? data.areaMin : null,
    area_max: data.areaMax !== '' && data.areaMax != null ? data.areaMax : null,
    preco_min: data.precoMin !== '' && data.precoMin != null ? data.precoMin : null,
    preco_max: data.precoMax !== '' && data.precoMax != null ? data.precoMax : null,
    total_unidades: data.totalUnidades !== '' && data.totalUnidades != null ? Number(data.totalUnidades) : null,
    unidades_disponiveis: data.unidadesDisponiveis !== '' && data.unidadesDisponiveis != null ? Number(data.unidadesDisponiveis) : null,
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
