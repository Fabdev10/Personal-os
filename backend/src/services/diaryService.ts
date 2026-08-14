import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function create(data: { userId: string; title: string; content: string; date?: string; mood?: string; energy?: number; tags?: string[] }) {
  const entry = await prisma.diaryEntry.create({
    data: {
      userId: data.userId,
      title: data.title || 'Untitled',
      content: data.content || '',
      date: data.date ? new Date(data.date) : new Date(),
      mood: data.mood ? (data.mood as any) : 'NEUTRAL',
      energy: data.energy ?? 3,
    },
  })
  // tags and relations later
  return entry
}

export async function list(userId: string) {
  return prisma.diaryEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } })
}

export async function get(id: string, userId: string) {
  return prisma.diaryEntry.findFirst({ where: { id, userId } })
}

export async function update(id: string, userId: string, patch: any) {
  const existing = await prisma.diaryEntry.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  return prisma.diaryEntry.update({ where: { id }, data: { ...patch, date: patch.date ? new Date(patch.date) : existing.date } })
}

export async function remove(id: string, userId: string) {
  const existing = await prisma.diaryEntry.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  return prisma.diaryEntry.delete({ where: { id } })
}
