import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
const prisma = new PrismaClient()

async function main(){
  const hashed = await argon2.hash('password123')
  const user = await prisma.user.upsert({
    where: { email: 'you@example.com' },
    update: {},
    create: {
      email: 'you@example.com',
      username: 'you',
      password: hashed
    }
  })
  console.log('Seeded user', user.email)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(()=>prisma.$disconnect())
