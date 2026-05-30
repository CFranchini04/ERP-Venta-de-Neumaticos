import { Router } from 'express'
import salariosController from '../../controllers/rrhh/salarios.controller.js'

const router = Router()

// Procesos de pago
router.get('/procesos', salariosController.getAllProcesos)
router.get('/procesos/:id', salariosController.getProceso)
router.post('/procesos', salariosController.postProceso)
router.patch('/procesos/:id/estado', salariosController.updateEstadoProceso)

// Pagos empleados
router.get('/pagos', salariosController.getAllPagos)
router.get('/pagos/tabla', salariosController.getTablePagos)
router.get('/pagos/empleado/:id', salariosController.getPagosByEmpleado)
router.get('/pagos/proceso/:id', salariosController.getPagosByProceso)
router.get('/pagos/:id', salariosController.getPago)
router.post('/pagos', salariosController.postPago)
router.put('/pagos/:id', salariosController.updatePago)
router.patch('/pagos/:id/estado', salariosController.updateEstadoPago)
router.delete('/pagos/:id', salariosController.deletePago)

// PHC
router.get('/salario/empleado/:id', salariosController.getSalarioEmpleado)

export default router