import Fastify from 'fastify'
import { corsPlugin } from './plugins/cors'
import { jwtPlugin } from './plugins/jwt'
import { multipartPlugin } from './plugins/multipart'
import { rateLimitPlugin } from './plugins/rateLimit'
import { authRoutes } from './routes/auth'
import { empreendimentosPublicRoutes } from './routes/empreendimentos.public'
import { empreendimentosAdminRoutes } from './routes/empreendimentos.admin'
import { leadsRoutes } from './routes/leads'
import { usuariosRoutes } from './routes/usuarios'

const app = Fastify({ logger: true })

async function bootstrap() {
  // Plugins
  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(multipartPlugin)
  await app.register(rateLimitPlugin)

  // Rotas
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(empreendimentosPublicRoutes, { prefix: '/api/empreendimentos' })
  await app.register(empreendimentosAdminRoutes, { prefix: '/api/admin/empreendimentos' })
  await app.register(leadsRoutes)
  await app.register(usuariosRoutes, { prefix: '/api/admin/usuarios' })

  // Health check
  app.get('/health', async () => ({ status: 'ok' }))

  const port = Number(process.env.PORT) || 3001
  const host = process.env.HOST || '0.0.0.0'

  await app.listen({ port, host })
  console.log(`API rodando em http://${host}:${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
