import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { PrismaClient, Role } from '@prisma/client'
import { verifyJWT } from '../middlewares/verifyJWT'
import { requireRole } from '../middlewares/requireRole'
import { getRedis } from '../services/redis.service'

const prisma = new PrismaClient()

const createSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  role: z.nativeEnum(Role),
  ativo: z.boolean().default(true),
})

const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
  ativo: z.boolean().optional(),
})

export async function usuariosRoutes(app: FastifyInstance) {
  const adminOrGerente = [verifyJWT, requireRole('ADMIN', 'GERENTE')]

  // GET /api/admin/usuarios
  app.get('/', { preHandler: adminOrGerente }, async (request, reply) => {
    const user = request.user as { role: Role }

    const usuarios = await prisma.user.findMany({
      where: user.role === 'GERENTE' ? { role: 'EDITOR' } : {},
      select: { id: true, nome: true, email: true, role: true, ativo: true, created_at: true },
      orderBy: { created_at: 'desc' },
    })
    return reply.send(usuarios)
  })

  // POST /api/admin/usuarios
  app.post('/', { preHandler: adminOrGerente }, async (request, reply) => {
    const actor = request.user as { role: Role }
    const data = createSchema.parse(request.body)

    // GERENTE só pode criar EDITOR
    if (actor.role === 'GERENTE' && data.role !== 'EDITOR') {
      return reply.status(403).send({ message: 'Gerentes só podem criar Editores.' })
    }

    const senha_hash = await bcrypt.hash(data.senha, 12)
    const usuario = await prisma.user.create({
      data: { nome: data.nome, email: data.email, senha_hash, role: data.role, ativo: data.ativo },
      select: { id: true, nome: true, email: true, role: true, ativo: true, created_at: true },
    })
    return reply.status(201).send(usuario)
  })

  // PUT /api/admin/usuarios/:id
  app.put('/:id', { preHandler: adminOrGerente }, async (request, reply) => {
    const actor = request.user as { id: string; role: Role }
    const { id } = request.params as { id: string }
    const data = updateSchema.parse(request.body)

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return reply.status(404).send({ message: 'Usuário não encontrado.' })

    // GERENTE não pode editar GERENTE ou ADMIN
    if (actor.role === 'GERENTE' && target.role !== 'EDITOR') {
      return reply.status(403).send({ message: 'Acesso negado.' })
    }

    const updateData: Record<string, unknown> = { ...data }
    if (data.senha) {
      updateData.senha_hash = await bcrypt.hash(data.senha, 12)
      delete updateData.senha
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nome: true, email: true, role: true, ativo: true, created_at: true },
    })
    return reply.send(updated)
  })

  // DELETE /api/admin/usuarios/:id
  app.delete('/:id', { preHandler: [verifyJWT, requireRole('ADMIN', 'GERENTE')] }, async (request, reply) => {
    const actor = request.user as { id: string; role: Role }
    const { id } = request.params as { id: string }

    if (actor.id === id) {
      return reply.status(400).send({ message: 'Você não pode excluir a si mesmo.' })
    }

    await prisma.user.delete({ where: { id } })
    return reply.status(204).send()
  })

  // PATCH /api/admin/usuarios/:id/ativar
  app.patch('/:id/ativar', { preHandler: adminOrGerente }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updated = await prisma.user.update({ where: { id }, data: { ativo: true } })
    return reply.send(updated)
  })

  // PATCH /api/admin/usuarios/:id/desativar
  app.patch('/:id/desativar', { preHandler: adminOrGerente }, async (request, reply) => {
    const actor = request.user as { id: string }
    const { id } = request.params as { id: string }

    if (actor.id === id) {
      return reply.status(400).send({ message: 'Você não pode desativar a si mesmo.' })
    }

    await prisma.user.update({ where: { id }, data: { ativo: false } })

    // Invalida todos os tokens do usuário adicionando um marker no Redis
    const redis = getRedis()
    await redis.set(`user_deactivated:${id}`, '1', 'EX', 7 * 24 * 60 * 60)

    return reply.send({ message: 'Usuário desativado.' })
  })
}
