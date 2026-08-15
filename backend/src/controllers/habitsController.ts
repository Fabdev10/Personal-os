import { Request, Response } from 'express'
import * as habitsService from '../services/habitsService'
import * as authService from '../services/authService'

export async function listHabits(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    res.json({ habits: await habitsService.list(user.id) })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function createHabit(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const h = await habitsService.create({ userId: user.id, ...req.body })
    res.json({ habit: h })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function toggleHabit(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const { date } = req.body
    if (!date) return res.status(400).json({ error: 'date required' })
    const result = await habitsService.toggle(req.params.id as string, user.id, date)
    res.json(result)
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function deleteHabit(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    await habitsService.remove(req.params.id as string, user.id)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}
