import { Router } from 'express'
import periodosController from '../../controllers/contabilidad/periodos.controller.js'

const router = Router()
router.get('/', periodosController.getPeriodos)
router.get('/:id', periodosController.getPeriodo)
router.post('/', periodosController.postPeriodo)
router.patch('/:id/estado', periodosController.patchEstado)
router.delete('/:id', periodosController.deletePeriodo)

export default router
