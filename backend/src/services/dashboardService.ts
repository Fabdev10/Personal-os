import { PrismaClient } from '@prisma/client'
import * as habitsService from './habitsService'
import * as studyService from './studyService'

const prisma = new PrismaClient()

export async function get(userId: string) {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    diaryCount,
    diaryThisWeek,
    activeGoals,
    completedGoals,
    lastWorkout,
    habitStreak,
    studyStats,
    avgEnergy,
  ] = await Promise.all([
    prisma.diaryEntry.count({ where: { userId } }),
    prisma.diaryEntry.count({ where: { userId, date: { gte: weekAgo } } }),
    prisma.goal.count({ where: { userId, status: 'IN_PROGRESS' } }),
    prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.workout.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    habitsService.streak(userId),
    studyService.weeklyStats(userId),
    prisma.diaryEntry.aggregate({ where: { userId }, _avg: { energy: true } }),
  ])

  // Mood distribution (last 30 entries)
  const recentEntries = await prisma.diaryEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30,
    select: { mood: true, energy: true, date: true },
  })

  return {
    diary: {
      total: diaryCount,
      thisWeek: diaryThisWeek,
      avgEnergy: +(avgEnergy._avg.energy ?? 0).toFixed(1),
      recentMoods: recentEntries.map(e => ({ mood: e.mood, date: e.date })),
    },
    goals: { active: activeGoals, completed: completedGoals },
    habits: { streak: habitStreak },
    study: studyStats,
    workout: lastWorkout ? { date: lastWorkout.date, type: lastWorkout.type, duration: lastWorkout.duration } : null,
  }
}
