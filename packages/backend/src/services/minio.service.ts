import * as Minio from 'minio'
import { randomBytes } from 'crypto'
import slugify from 'slugify'

const BUCKET = process.env.MINIO_BUCKET || 'empreendimentos'
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'

let client: Minio.Client | null = null

function getClient(): Minio.Client {
  if (!client) {
    client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.NODE_ENV === 'production',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    })
  }
  return client
}

export async function uploadFoto(
  empreendimentoId: string,
  filename: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  const minio = getClient()
  const safeName = slugify(filename.replace(/\.[^/.]+$/, ''), { lower: true, strict: true })
  const ext = filename.split('.').pop()
  const objectName = `empreendimentos/${empreendimentoId}/${Date.now()}-${safeName}.${ext}`

  await minio.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': mimetype,
  })

  return `${PUBLIC_URL}/${BUCKET}/${objectName}`
}

export async function deleteFoto(url: string): Promise<void> {
  const minio = getClient()
  // Extrai o objectName da URL pública
  const prefix = `${PUBLIC_URL}/${BUCKET}/`
  const objectName = url.replace(prefix, '')
  await minio.removeObject(BUCKET, objectName)
}
