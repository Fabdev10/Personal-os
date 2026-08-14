import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { Request } from 'express'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export async function register({ email, username, password }: { email: string; username?: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('User already exists')
  const hash = await argon2.hash(password)
  return prisma.user.create({ data: { email, username, password: hash } })
}

export async function login({ email, password }: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid credentials')
  const valid = await argon2.verify(user.password, password)
  if (!valid) throw new Error('Invalid credentials')
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  return { token, user }
}

export async function getUserFromRequest(req: Request) {
  const token = req.cookies?.token
  if (!token) return null
  try {
    const payload: any = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    return user
  } catch (err) {
    return null
  }
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  const valid = await argon2.verify(user.password, oldPassword)
  if (!valid) throw new Error('Invalid current password')
  const hash = await argon2.hash(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { password: hash } })
}
