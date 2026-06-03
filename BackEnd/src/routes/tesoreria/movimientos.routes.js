import { Router } from 'express'
import movimientosController from '../../controllers/tesoreria/movimientos.controller.js'

const router = Router()

// Bancos
router.get('/bancos', movimientosController.getAllBancos)
router.get('/bancos/:id', movimientosController.getBanco)
router.post('/bancos', movimientosController.postBanco)
router.put('/bancos/:id', movimientosController.updateBanco)
router.delete('/bancos/:id', movimientosController.deleteBanco)

// Cuentas bancarias
router.get('/cuentas', movimientosController.getAllCuentas)
router.get('/cuentas/:id', movimientosController.getCuenta)
router.post('/cuentas', movimientosController.postCuenta)
router.put('/cuentas/:id', movimientosController.updateCuenta)
router.delete('/cuentas/:id', movimientosController.deleteCuenta)

// Movimientos
router.get('/', movimientosController.getAllMovimientos)
router.get('/tabla', movimientosController.getTableMovimientos)
router.get('/estados', movimientosController.getEstados)
router.get('/cuenta/:id', movimientosController.getMovimientosByCuenta)
router.get('/:id', movimientosController.getMovimiento)
router.post('/', movimientosController.postMovimiento)
router.put('/:id', movimientosController.updateMovimiento)
router.put('/:id/conciliar', movimientosController.updateConciliacion)
router.patch('/:id/estado', movimientosController.updateEstadoMovimiento)
router.delete('/:id', movimientosController.deleteMovimiento)

export default router