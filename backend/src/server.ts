import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'
import authRouter from './routes/auth'
import diaryRouter from './routes/diary'

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

app.get('/api/ping', (req, res) => {
  res.json({ pong: true })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
