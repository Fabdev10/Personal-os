import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function list(userId: string) {
  return prisma.workout.findMany({
    where: { userId },
    include: { exercises: { include: { sets: { orderBy: { setOrder: 'asc' } } } } },
    orderBy: { date: 'desc' },
  })
}

export async function get(id: string, userId: string) {
  return prisma.workout.findFirst({
    where: { id, userId },
    include: { exercises: { include: { sets: { orderBy: { setOrder: 'asc' } } } } },
  })
}

export async function create(data: {
  userId: string
  date?: string
  duration?: number
  type?: string
  notes?: string
  exercises?: { name: string; notes?: string; sets: { reps: number; weight?: number; rpe?: number }[] }[]
}) {
  return prisma.workout.create({
    data: {
      userId: data.userId,
      date: data.date ? new Date(data.date) : new Date(),
      duration: data.duration,
      type: data.type,
      notes: data.notes,
      exercises: {
        create: (data.exercises || []).map(ex => ({
          name: ex.name,
          notes: ex.notes,
          sets: {
            create: ex.sets.map((s, i) => ({
              reps: s.reps,
              weight: s.weight,
              rpe: s.rpe,
              setOrder: i,
            })),
          },
        })),
      },
    },
    include: { exercises: { include: { sets: { orderBy: { setOrder: 'asc' } } } } },
  })
}

export async function update(id: string, userId: string, patch: any) {
  const existing = await prisma.workout.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  return prisma.workout.update({
    where: { id },
    data: {
      date: patch.date ? new Date(patch.date) : existing.date,
      duration: patch.duration ?? existing.duration,
      type: patch.type ?? existing.type,
      notes: patch.notes ?? existing.notes,
    },
    include: { exercises: { include: { sets: { orderBy: { setOrder: 'asc' } } } } },
  })
}

export async function remove(id: string, userId: string) {
  const existing = await prisma.workout.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('not found')
  // cascade: sets → exercises → workout
  const exercises = await prisma.exercise.findMany({ where: { workoutId: id } })
  for (const ex of exercises) {
    await prisma.workoutSet.deleteMany({ where: { exerciseId: ex.id } })
  }
  await prisma.exercise.deleteMany({ where: { workoutId: id } })
  return prisma.workout.delete({ where: { id } })
}
