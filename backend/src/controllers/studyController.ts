import { Request, Response } from 'express'
import * as studyService from '../services/studyService'
import * as authService from '../services/authService'

export async function listSessions(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    res.json({ sessions: await studyService.list(user.id) })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function createSession(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const s = await studyService.create({ userId: user.id, ...req.body })
    res.json({ session: s })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function updateSession(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const s = await studyService.update(req.params.id as string, user.id, req.body)
    res.json({ session: s })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function deleteSession(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    await studyService.remove(req.params.id as string, user.id)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function getWeeklyStats(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    res.json(await studyService.weeklyStats(user.id))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}
