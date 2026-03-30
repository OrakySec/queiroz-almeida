import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyJWT } from '../middlewares/verifyJWT'
import { requireRole } from '../middlewares/requireRole'
import { sendLeadEmail } from '../services/email.service'
import { prisma } from '../lib/prisma'

const leadSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  whatsapp: z.string().min(10),
  interesse: z.string().optional(),
  origem: z.string().optional(),
})

export async function leadsRoutes(app: FastifyInstance) {
  // POST /api/leads — público (formulário do site)
  app.post('/api/leads', async (request, reply) => {
    const data = leadSchema.parse(request.body)

    const lead = await prisma.lead.create({ data })

    // Tenta enviar e-mail, mas não bloqueia se falhar
    sendLeadEmail(lead).catch((err) => {
      console.error('Falha ao enviar e-mail de lead:', err)
    })

    return reply.status(201).send({ message: 'Obrigado! Entraremos em contato em breve.' })
  })

  // GET /api/admin/leads
  app.get(
    '/api/admin/leads',
    { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] },
    async (request, reply) => {
      const { lido, q, page = '1' } = request.query as { lido?: string; q?: string; page?: string }
      const take = 20
      const skip = (Number(page) - 1) * take

      const where = {
        ...(lido !== undefined ? { lido: lido === 'true' } : {}),
        ...(q ? { OR: [{ nome: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] } : {}),
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({ where, orderBy: { created_at: 'desc' }, skip, take }),
        prisma.lead.count({ where }),
      ])

      return reply.send({ leads, total, page: Number(page), pages: Math.ceil(total / take) })
    }
  )

  // PATCH /api/admin/leads/:id/lido
  app.patch(
    '/api/admin/leads/:id/lido',
    { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const updated = await prisma.lead.update({ where: { id }, data: { lido: true } })
      return reply.send(updated)
    }
  )

  // DELETE /api/admin/leads/:id
  app.delete(
    '/api/admin/leads/:id',
    { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      await prisma.lead.delete({ where: { id } })
      return reply.status(204).send()
    }
  )
}
