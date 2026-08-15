import { Router } from 'express'
import { listGoals, createGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone } from '../controllers/goalsController'

const router = Router()
router.get('/', listGoals)
router.post('/', createGoal)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)
router.post('/:id/milestones', addMilestone)
router.post('/:id/milestones/:msId/toggle', toggleMilestone)
export default router
