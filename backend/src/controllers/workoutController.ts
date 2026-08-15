import { Request, Response } from 'express'
import * as workoutService from '../services/workoutService'
import * as authService from '../services/authService'

export async function listWorkouts(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    res.json({ workouts: await workoutService.list(user.id) })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function getWorkout(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const w = await workoutService.get(req.params.id as string, user.id)
    if (!w) return res.status(404).json({ error: 'not found' })
    res.json({ workout: w })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function createWorkout(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const w = await workoutService.create({ userId: user.id, ...req.body })
    res.json({ workout: w })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function updateWorkout(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const w = await workoutService.update(req.params.id as string, user.id, req.body)
    res.json({ workout: w })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}

export async function deleteWorkout(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    await workoutService.remove(req.params.id as string, user.id)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
}
