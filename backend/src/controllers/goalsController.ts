import { Request, Response } from 'express'
import * as goalsService from '../services/goalsService'
import * as authService from '../services/authService'

export async function listGoals(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    res.json({ goals: await goalsService.list(user.id) })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function createGoal(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const goal = await goalsService.create({ userId: user.id, ...req.body })
    res.json({ goal })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function updateGoal(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const goal = await goalsService.update(req.params.id as string, user.id, req.body)
    res.json({ goal })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function deleteGoal(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    await goalsService.remove(req.params.id as string, user.id)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function addMilestone(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const ms = await goalsService.addMilestone(req.params.id as string, user.id, req.body.title, req.body.dueDate)
    res.json({ milestone: ms })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function toggleMilestone(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const ms = await goalsService.toggleMilestone(req.params.msId as string, user.id)
    res.json({ milestone: ms })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}
