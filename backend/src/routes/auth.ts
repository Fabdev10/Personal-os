import { Router } from 'express'
import { register, login, logout, me, changePassword } from '../controllers/authController'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', me)
router.post('/change-password', changePassword)

export default router
