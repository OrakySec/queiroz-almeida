import Redis from 'ioredis'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    client.on('error', (err) => console.error('Redis error:', err))
  }
  return client
}

export async function addToBlacklist(token: string, expiresInSeconds: number) {
  const redis = getRedis()
  await redis.set(`blacklist:${token}`, '1', 'EX', expiresInSeconds)
}
