import { PrismaClient, GoalCategory, GoalStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function list(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    include: { milestones: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function create(data: {
  userId: string
  title: string
  description?: string
  category: GoalCategory
  priority?: number
  status?: GoalStatus
  startDate?: string
  deadline?: string
}) {
  return prisma.goal.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority ?? 3,
      status: data.status ?? 'NOT_STARTED',
      startDate: data.startDate ? new Date(data.startDate) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
    include: { milestones: true },
  })
}

export async function update(id: string, userId: string, patch: any) {
  const existing = await prisma.goal.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  return prisma.goal.update({
    where: { id },
    data: {
      ...patch,
      startDate: patch.startDate ? new Date(patch.startDate) : existing.startDate,
      deadline: patch.deadline ? new Date(patch.deadline) : existing.deadline,
    },
    include: { milestones: true },
  })
}

export async function remove(id: string, userId: string) {
  const existing = await prisma.goal.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  await prisma.goalMilestone.deleteMany({ where: { goalId: id } })
  return prisma.goal.delete({ where: { id } })
}

export async function addMilestone(goalId: string, userId: string, title: string, dueDate?: string) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } })
  if (!goal) throw new Error('goal not found')
  return prisma.goalMilestone.create({
    data: { goalId, title, dueDate: dueDate ? new Date(dueDate) : null },
  })
}

export async function toggleMilestone(milestoneId: string, userId: string) {
  const ms = await prisma.goalMilestone.findFirst({
    where: { id: milestoneId },
    include: { goal: true },
  })
  if (!ms || ms.goal.userId !== userId) throw new Error('not found')
  const updated = await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: { done: !ms.done },
  })
  // recalculate goal progress
  const all = await prisma.goalMilestone.findMany({ where: { goalId: ms.goalId } })
  const progress = all.length > 0 ? (all.filter(m => m.done || m.id === milestoneId ? !ms.done : false).length / all.length) * 100 : 0
  const doneCount = all.filter(m => (m.id === milestoneId ? !ms.done : m.done)).length
  const pct = all.length > 0 ? (doneCount / all.length) * 100 : 0
  await prisma.goal.update({ where: { id: ms.goalId }, data: { progress: pct } })
  return updated
}
