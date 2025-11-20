const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const plain = process.env.SEED_ADMIN_PASSWORD || 'password123'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(plain, 10)
    const user = await prisma.user.create({ data: { email, passwordHash, name: 'Admin' } })
    console.log('Seeded user:', user.email)
  } else {
    console.log('Seed user already exists')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
