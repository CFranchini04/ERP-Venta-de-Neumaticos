import { Router } from 'express'
import cuentasController from '../../controllers/contabilidad/cuentas.controller.js'

const router = Router()

router.get('/', cuentasController.getCuentas)
router.get('/:codigo', cuentasController.getCuenta)
router.post('/', cuentasController.postCuenta)
router.put('/:codigo', cuentasController.putCuenta)
router.delete('/:codigo', cuentasController.deleteCuenta)

export default router