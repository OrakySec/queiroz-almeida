/** @type {import('next').NextConfig} */

// Resolve o hostname do MinIO a partir da variável de ambiente para que
// funcione tanto em dev (localhost:9000) quanto em produção (storage.domínio.com.br)
function parseMinioPattern() {
  const raw = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'
  try {
    const u = new URL(raw)
    return {
      protocol: /** @type {'http'|'https'} */ (u.protocol.replace(':', '')),
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: '/**',
    }
  } catch {
    return { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' }
  }
}

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // dev local
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      // produção — lido do env para suportar qualquer domínio sem rebuild
      parseMinioPattern(),
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
