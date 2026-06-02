import { Router } from 'express'
import ctrl from '../../controllers/rrhh/salarios.controller.js'

const router = Router()

// ─── PROCESOS DE PAGO ───────────────────────────────────────────
router.get('/procesos/ultimo',        ctrl.getUltimoProceso)      // ← antes de /:id
router.get('/procesos',               ctrl.getAllProcesos)
router.get('/procesos/:id',           ctrl.getProceso)
router.post('/procesos',              ctrl.postProceso)
router.patch('/procesos/:id/estado',  ctrl.updateEstadoProceso)

// ─── PAGOS EMPLEADOS ────────────────────────────────────────────
router.get('/pagos/tabla',            ctrl.getTablePagos)          // ← antes de /:id
router.get('/pagos',                  ctrl.getAllPagos)
router.get('/pagos/:id',              ctrl.getPago)
router.get('/pagos/empleado/:id',     ctrl.getPagosByEmpleado)
router.get('/pagos/proceso/:id',      ctrl.getPagosByProceso)
router.post('/pagos',                 ctrl.postPago)
router.put('/pagos/:id',              ctrl.updatePago)
router.patch('/pagos/:id/estado',     ctrl.updateEstadoPago)
router.delete('/pagos/:id',           ctrl.deletePago)

// ─── PHC ────────────────────────────────────────────────────────
router.get('/salario/empleado/:id',   ctrl.getSalarioEmpleado)

// ─── NOVEDADES ──────────────────────────────────────────────────
router.get('/novedades/:tipo_novedad', ctrl.searchNovedades)       // ← antes de /:id
router.get('/novedades',              ctrl.getAllNovedades)
router.get('/novedades/detalle/:id',  ctrl.getNovedad)
router.post('/novedades',             ctrl.postNovedad)
router.put('/novedades/:id',          ctrl.updateNovedad)
router.patch('/novedades/:id/estado', ctrl.updateEstadoNovedad)

export default router