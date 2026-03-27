import type { FastifyRequest, FastifyReply } from 'fastify'
import { getRedis } from '../services/redis.service'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()

    // Verifica se o token está na blacklist (logout ou usuário desativado)
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (token) {
      const redis = getRedis()
      const payload = request.user as { id: string }

      const [blocked, deactivated] = await Promise.all([
        redis.get(`blacklist:${token}`),
        redis.get(`user_deactivated:${payload.id}`),
      ])

      if (blocked || deactivated) {
        return reply.status(401).send({ message: 'Token inválido ou expirado.' })
      }
    }
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }
}
