import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'
import authRouter from './routes/auth'
import diaryRouter from './routes/diary'
import goalsRouter from './routes/goals'
import workoutsRouter from './routes/workouts'
import studyRouter from './routes/study'
import habitsRouter from './routes/habits'
import dashboardRouter from './routes/dashboard'
import aiRouter from './routes/ai'
import agendaRouter from './routes/agenda'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ status: 'error', error: String(err) })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/diary', diaryRouter)
app.use('/api/goals', goalsRouter)
app.use('/api/workouts', workoutsRouter)
app.use('/api/study', studyRouter)
app.use('/api/habits', habitsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/ai', aiRouter)
app.use('/api/agenda', agendaRouter)

app.get('/api/ping', (req, res) => { res.json({ pong: true }) })

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
