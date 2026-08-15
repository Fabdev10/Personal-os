import { Request, Response } from 'express'
import * as dashboardService from '../services/dashboardService'
import * as authService from '../services/authService'

export async function getDashboard(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const data = await dashboardService.get(user.id)
    res.json(data)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}
