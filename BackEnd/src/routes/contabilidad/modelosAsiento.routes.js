import { Router } from 'express'
import modelosController from '../../controllers/contabilidad/modelosAsiento.controller.js'

const router = Router()
router.get('/', modelosController.getModelos)
router.get('/:modulo/:evento', modelosController.getModelo)
router.post('/', modelosController.postModelo)
router.put('/:modulo/:evento', modelosController.putModelo)
router.delete('/:modulo/:evento', modelosController.deleteModelo)

export default router
