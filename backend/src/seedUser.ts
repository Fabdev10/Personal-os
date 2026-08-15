import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const email = 'fabmaz91@gmail.com'
  const username = 'Fabio'
  const passwordRaw = 'Password'
  const hash = await argon2.hash(passwordRaw)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      username,
      password: hash,
    },
    create: {
      email,
      username,
      password: hash,
    },
  })

  console.log('USER_CREATED_SUCCESSFULLY:', user.id, user.email, user.username)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
