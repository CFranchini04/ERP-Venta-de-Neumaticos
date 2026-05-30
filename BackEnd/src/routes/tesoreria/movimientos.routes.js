import { Router } from 'express'
import movimientosController from '../../controllers/tesoreria/movimientos.controller.js'

const router = Router()

// Movimientos
router.get('/', movimientosController.getAllMovimientos)
router.get('/tabla', movimientosController.getTableMovimientos)
router.get('/:id', movimientosController.getMovimiento)
router.post('/', movimientosController.postMovimiento)
router.put('/:id', movimientosController.updateMovimiento)
router.patch('/:id/estado', movimientosController.updateEstadoMovimiento)
router.delete('/:id', movimientosController.deleteMovimiento)

// Cuentas bancarias
router.get('/cuentas', movimientosController.getAllCuentas)
router.get('/cuentas/:id', movimientosController.getCuenta)
router.post('/cuentas', movimientosController.postCuenta)
router.put('/cuentas/:id', movimientosController.updateCuenta)
router.delete('/cuentas/:id', movimientosController.deleteCuenta)

export default router