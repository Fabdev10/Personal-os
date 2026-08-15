import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function list(userId: string) {
  return prisma.studySession.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })
}

export async function create(data: {
  userId: string
  date?: string
  duration: number
  subject: string
  topic?: string
  notes?: string
  difficulty?: number
}) {
  return prisma.studySession.create({
    data: {
      userId: data.userId,
      date: data.date ? new Date(data.date) : new Date(),
      duration: data.duration,
      subject: data.subject,
      topic: data.topic,
      notes: data.notes,
      difficulty: data.difficulty,
    },
  })
}

export async function update(id: string, userId: string, patch: any) {
  const existing = await prisma.studySession.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  return prisma.studySession.update({
    where: { id },
    data: {
      date: patch.date ? new Date(patch.date) : existing.date,
      duration: patch.duration ?? existing.duration,
      subject: patch.subject ?? existing.subject,
      topic: patch.topic ?? existing.topic,
      notes: patch.notes ?? existing.notes,
      difficulty: patch.difficulty ?? existing.difficulty,
    },
  })
}

export async function remove(id: string, userId: string) {
  const existing = await prisma.studySession.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  return prisma.studySession.delete({ where: { id } })
}

export async function weeklyStats(userId: string) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const sessions = await prisma.studySession.findMany({
    where: { userId, date: { gte: weekAgo } },
  })
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)
  return { sessions: sessions.length, totalMinutes, totalHours: +(totalMinutes / 60).toFixed(1) }
}
