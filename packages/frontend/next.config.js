/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // dev local
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      // qualquer subdomínio de teste / produção (wildcard de 1 nível)
      { protocol: 'https', hostname: '*.ykaromarques.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.queirozalmeidaconstrutora.com.br', pathname: '/**' },
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
