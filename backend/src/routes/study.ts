import { Router } from 'express'
import { listSessions, createSession, updateSession, deleteSession, getWeeklyStats } from '../controllers/studyController'

const router = Router()
router.get('/', listSessions)
router.get('/stats', getWeeklyStats)
router.post('/', createSession)
router.put('/:id', updateSession)
router.delete('/:id', deleteSession)
export default router
