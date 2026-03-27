import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Role } from '@prisma/client'

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string; email: string; role: Role }
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ message: 'Acesso negado.' })
    }
  }
}
