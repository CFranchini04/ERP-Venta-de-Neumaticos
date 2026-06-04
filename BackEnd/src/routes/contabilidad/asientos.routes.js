import { Router } from 'express'
import asientosController from '../../controllers/contabilidad/asientos.controller.js'

const router = Router()
router.get('/', asientosController.getAsientos)
router.get('/:id', asientosController.getAsiento)
router.post('/', asientosController.postAsiento)
router.put('/:id', asientosController.putAsiento)
router.delete('/:id', asientosController.deleteAsiento)

export default router
