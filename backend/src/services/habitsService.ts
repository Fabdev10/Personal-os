import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function list(userId: string) {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      completions: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
    orderBy: { id: 'asc' },
  })
  return habits
}

export async function create(data: { userId: string; name: string; frequency?: string; color?: string }) {
  return prisma.habit.create({
    data: {
      userId: data.userId,
      name: data.name,
      frequency: data.frequency || 'daily',
      color: data.color || '#7c6ef9',
      startDate: new Date(),
    },
    include: { completions: true },
  })
}

export async function toggle(habitId: string, userId: string, date: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } })
  if (!habit) throw new Error('not found')
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)
  const existing = await prisma.habitCompletion.findFirst({
    where: { habitId, date: { gte: day, lt: nextDay } },
  })
  if (existing) {
    await prisma.habitCompletion.delete({ where: { id: existing.id } })
    return { done: false }
  } else {
    await prisma.habitCompletion.create({ data: { habitId, date: day } })
    return { done: true }
  }
}

export async function remove(id: string, userId: string) {
  const habit = await prisma.habit.findFirst({ where: { id, userId } })
  if (!habit) throw new Error('not found')
  await prisma.habitCompletion.deleteMany({ where: { habitId: id } })
  return prisma.habit.delete({ where: { id } })
}

export async function streak(userId: string) {
  const habits = await prisma.habit.findMany({ where: { userId }, select: { id: true } })
  if (!habits.length) return 0
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let d = 0; d < 365; d++) {
    const day = new Date(today)
    day.setDate(day.getDate() - d)
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const completions = await prisma.habitCompletion.findMany({
      where: { habitId: { in: habits.map(h => h.id) }, date: { gte: day, lt: nextDay } },
    })
    if (completions.length >= habits.length) {
      currentStreak++
    } else if (d > 0) {
      break
    }
  }
  return currentStreak
}
