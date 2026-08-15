import { Router } from 'express'
import { listWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout } from '../controllers/workoutController'

const router = Router()
router.get('/', listWorkouts)
router.post('/', createWorkout)
router.get('/:id', getWorkout)
router.put('/:id', updateWorkout)
router.delete('/:id', deleteWorkout)
export default router
