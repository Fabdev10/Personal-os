import { Router } from 'express'
import { listHabits, createHabit, toggleHabit, deleteHabit } from '../controllers/habitsController'

const router = Router()
router.get('/', listHabits)
router.post('/', createHabit)
router.post('/:id/toggle', toggleHabit)
router.delete('/:id', deleteHabit)
export default router
