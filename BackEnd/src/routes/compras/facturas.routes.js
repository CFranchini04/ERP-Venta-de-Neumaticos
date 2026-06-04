import { Router } from 'express'
import facturasController from '../../controllers/compras/facturas.controller.js'

const router = Router()

router.get('/', facturasController.getAllFacturas)
router.get('/tabla', facturasController.getTableFacturas)
router.get('/next-codigo', facturasController.getNextCodigoFactura)
router.get('/pendientes-pago', facturasController.getFacturasPendientesPago)
router.get('/codigo/:codigo', facturasController.getFacturaByCodigo)
router.get('/:id', facturasController.getFactura)
router.post('/', facturasController.postFactura)
router.put('/:id/confirmar', facturasController.confirmarFacturaPlaceholder)
router.put('/:id', facturasController.updateFactura)
router.patch('/:id/estado', facturasController.updateEstadoFactura)
router.delete('/:id', facturasController.deleteFactura)

export default router
