import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateEventInput {
  userId: string
  title: string
  start: Date | string
  end?: Date | string
  allDay?: boolean
  type?: string
  color?: string
  notes?: string
}

export interface UpdateEventInput {
  title?: string
  start?: Date | string
  end?: Date | string
  allDay?: boolean
  type?: string
  color?: string
  notes?: string
}

export async function list(userId: string, startFrom?: Date, startTo?: Date) {
  const where: any = { userId }
  if (startFrom || startTo) {
    where.start = {}
    if (startFrom) where.start.gte = startFrom
    if (startTo) where.start.lte = startTo
  }

  return prisma.calendarEvent.findMany({
    where,
    orderBy: { start: 'asc' },
  })
}

export async function get(id: string, userId: string) {
  return prisma.calendarEvent.findFirst({
    where: { id, userId },
  })
}

export async function create(input: CreateEventInput) {
  return prisma.calendarEvent.create({
    data: {
      userId: input.userId,
      title: input.title,
      start: new Date(input.start),
      end: input.end ? new Date(input.end) : null,
      allDay: input.allDay ?? false,
      type: input.type || 'PERSONAL',
      color: input.color || '#7c6ef9',
      notes: input.notes || null,
    },
  })
}

export async function update(id: string, userId: string, input: UpdateEventInput) {
  const existing = await prisma.calendarEvent.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Event not found or unauthorized')

  const data: any = {}
  if (input.title !== undefined) data.title = input.title
  if (input.start !== undefined) data.start = new Date(input.start)
  if (input.end !== undefined) data.end = input.end ? new Date(input.end) : null
  if (input.allDay !== undefined) data.allDay = input.allDay
  if (input.type !== undefined) data.type = input.type
  if (input.color !== undefined) data.color = input.color
  if (input.notes !== undefined) data.notes = input.notes

  return prisma.calendarEvent.update({
    where: { id },
    data,
  })
}

export async function remove(id: string, userId: string) {
  const existing = await prisma.calendarEvent.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Event not found or unauthorized')

  return prisma.calendarEvent.delete({
    where: { id },
  })
}
