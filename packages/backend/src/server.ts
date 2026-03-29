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

// Valida variáveis obrigatórias antes de iniciar
const REQUIRED_ENVS = ['JWT_SECRET', 'DATABASE_URL', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY']
for (const key of REQUIRED_ENVS) {
  if (!process.env[key]) {
    console.error(`FATAL: variável de ambiente "${key}" não definida. Encerrando.`)
    process.exit(1)
  }
}

if (!process.env.MINIO_PUBLIC_URL) {
  console.warn('WARN: MINIO_PUBLIC_URL não definida — URLs de fotos podem estar incorretas em produção.')
}

const app = Fastify({ logger: true, bodyLimit: 50 * 1024 * 1024 }) // 50 MB para suportar uploads de PDF e fotos

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
