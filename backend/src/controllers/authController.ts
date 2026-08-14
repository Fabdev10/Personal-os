import { Request, Response } from 'express'
import * as authService from '../services/authService'

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await authService.register({ email, username, password })
    res.json({ user: { id: user.id, email: user.email, username: user.username } })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const { token, user } = await authService.login({ email, password })
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })
    res.json({ user: { id: user.id, email: user.email, username: user.username } })
  } catch (err: any) {
    res.status(401).json({ error: err.message })
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token')
  res.json({ ok: true })
}

export async function me(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    res.json({ user: { id: user.id, email: user.email, username: user.username } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    const { oldPassword, newPassword } = req.body
    await authService.changePassword(user.id, oldPassword, newPassword)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
