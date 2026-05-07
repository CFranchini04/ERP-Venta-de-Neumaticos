import { Router } from 'express'
import authController from '../../controllers/auth/auth.controller.js'

const router = Router()

router.post('/login', authController.login)
router.get('/rol', authController.getRol)

export default router