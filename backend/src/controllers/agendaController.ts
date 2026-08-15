import { Request, Response } from 'express'
import * as agendaService from '../services/agendaService'
import * as authService from '../services/authService'

export async function listEvents(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })

    const startFrom = req.query.from ? new Date(req.query.from as string) : undefined
    const startTo = req.query.to ? new Date(req.query.to as string) : undefined

    const events = await agendaService.list(user.id, startFrom, startTo)
    res.json({ events })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function getEvent(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })

    const event = await agendaService.get(req.params.id as string, user.id)
    if (!event) return res.status(404).json({ error: 'not found' })

    res.json({ event })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })

    const { title, start, end, allDay, type, color, notes } = req.body
    if (!title || !start) {
      return res.status(400).json({ error: 'Title and start date are required' })
    }

    const event = await agendaService.create({
      userId: user.id,
      title,
      start,
      end,
      allDay,
      type,
      color,
      notes,
    })

    res.json({ event })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })

    const event = await agendaService.update(req.params.id as string, user.id, req.body)
    res.json({ event })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })

    await agendaService.remove(req.params.id as string, user.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
