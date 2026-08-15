import { Request, Response } from 'express'
import * as diaryService from '../services/diaryService'
import * as authService from '../services/authService'

export async function listEntries(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const entries = await diaryService.list(user.id)
    res.json({ entries })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function createEntry(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const { title, content, date, mood, energy, tags } = req.body
    const entry = await diaryService.create({ userId: user.id, title, content, date, mood, energy, tags })
    res.json({ entry })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function getEntry(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const entry = await diaryService.get(req.params.id as string, user.id)
    if (!entry) return res.status(404).json({ error: 'not found' })
    res.json({ entry })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function updateEntry(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const entry = await diaryService.update(req.params.id as string, user.id, req.body)
    res.json({ entry })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function deleteEntry(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    await diaryService.remove(req.params.id as string, user.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
