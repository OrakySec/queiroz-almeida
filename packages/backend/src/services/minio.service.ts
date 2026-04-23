import * as Minio from 'minio'
import slugify from 'slugify'

const BUCKET = process.env.MINIO_BUCKET || 'empreendimentos'
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'

let client: Minio.Client | null = null
let bucketReady = false

function getClient(): Minio.Client {
  if (!client) {
    client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: false, // MinIO interno — SSL é tratado pelo Traefik
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    })
  }
  return client
}

/** Garante que o bucket existe e tem política de leitura pública */
async function ensureBucket(): Promise<void> {
  if (bucketReady) return
  const minio = getClient()
  const exists = await minio.bucketExists(BUCKET)
  if (!exists) {
    await minio.makeBucket(BUCKET, 'us-east-1')
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      }],
    })
    await minio.setBucketPolicy(BUCKET, policy)
  }
  bucketReady = true
}

export async function uploadFoto(
  empreendimentoId: string,
  filename: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  await ensureBucket()
  const minio = getClient()
  const safeName = slugify(filename.replace(/\.[^/.]+$/, ''), { lower: true, strict: true })
  const ext = filename.split('.').pop()
  // objectName NÃO inclui o bucket — a URL pública já o insere via /${BUCKET}/
  const objectName = `${empreendimentoId}/${Date.now()}-${safeName}.${ext}`

  await minio.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': mimetype,
  })

  return `${PUBLIC_URL}/${BUCKET}/${objectName}`
}

export async function uploadPdf(
  empreendimentoId: string,
  buffer: Buffer,
): Promise<string> {
  await ensureBucket()
  const minio = getClient()
  const objectName = `${empreendimentoId}/memorial-${Date.now()}.pdf`
  await minio.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': 'application/pdf',
  })
  return `${PUBLIC_URL}/${BUCKET}/${objectName}`
}

export async function deletePdf(url: string): Promise<void> {
  const minio = getClient()
  const prefix = `${PUBLIC_URL}/${BUCKET}/`
  const objectName = url.replace(prefix, '')
  await minio.removeObject(BUCKET, objectName)
}

export async function deleteFoto(url: string): Promise<void> {
  const minio = getClient()
  // Extrai o objectName da URL pública
  const prefix = `${PUBLIC_URL}/${BUCKET}/`
  const objectName = url.replace(prefix, '')
  await minio.removeObject(BUCKET, objectName)
}

export async function uploadFotoLocalizacao(
  empreendimentoId: string,
  filename: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  await ensureBucket()
  const minio = getClient()
  const ext = filename.split('.').pop() || 'jpg'
  const objectName = `${empreendimentoId}/localizacao-${Date.now()}.${ext}`
  await minio.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': mimetype,
  })
  return `${PUBLIC_URL}/${BUCKET}/${objectName}`
}

export async function deleteFotoLocalizacao(url: string): Promise<void> {
  const minio = getClient()
  const prefix = `${PUBLIC_URL}/${BUCKET}/`
  const objectName = url.replace(prefix, '')
  await minio.removeObject(BUCKET, objectName)
}
