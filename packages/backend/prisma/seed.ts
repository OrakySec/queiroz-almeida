import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const senha_hash = await bcrypt.hash('@Deligar89541300', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'orakysec@gmail.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'orakysec@gmail.com',
      senha_hash,
      role: 'ADMIN',
      ativo: true,
    },
  })

  console.log('Seed concluído. Usuário admin criado:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
