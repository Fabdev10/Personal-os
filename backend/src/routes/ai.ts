import { Router } from 'express'
import { getInsights } from '../controllers/aiController'

const router = Router()
router.post('/insights', getInsights)
router.get('/insights', getInsights)

export default router
