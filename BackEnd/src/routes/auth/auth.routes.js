import { Router } from 'express'
import authController from '../../controllers/auth/auth.controller.js'

const router = Router()

router.post('/login', authController.login)
router.get('/rol', authController.getRol)
router.post('/refresh', authController.refresh)
router.get('/usuarios', authController.getUsuarios)
router.patch('/usuarios/:id/permisos', authController.updatePermisos)
router.delete('/usuarios/:id', authController.deleteUsuario)
router.post('/usuarios', authController.createUsuario)

export default router
