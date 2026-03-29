import fp from 'fastify-plugin'
import multipart from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'

export const multipartPlugin = fp(async (app: FastifyInstance) => {
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB (fotos + PDFs)
      files: 20,
    },
  })
})
