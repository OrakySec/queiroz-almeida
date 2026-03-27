import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { verifyJWT } from '../middlewares/verifyJWT'
import { addToBlacklist } from '../services/redis.service'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.ativo) {
      return reply.status(401).send({ message: 'Credenciais inválidas.' })
    }

    const valid = await bcrypt.compare(password, user.senha_hash)
    if (!valid) {
      return reply.status(401).send({ message: 'Credenciais inválidas.' })
    }

    const token = app.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
    )

    return reply.send({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    })
  })

  // POST /api/auth/logout
  app.post('/logout', { preHandler: [verifyJWT] }, async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (token) {
      // Expira o token na blacklist em 7 dias (mesmo TTL do JWT)
      await addToBlacklist(token, 7 * 24 * 60 * 60)
    }
    return reply.send({ message: 'Logout realizado com sucesso.' })
  })

  // GET /api/auth/me
  app.get('/me', { preHandler: [verifyJWT] }, async (request, reply) => {
    const payload = request.user as { id: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
    })
    if (!user) return reply.status(404).send({ message: 'Usuário não encontrado.' })
    return reply.send(user)
  })
}
