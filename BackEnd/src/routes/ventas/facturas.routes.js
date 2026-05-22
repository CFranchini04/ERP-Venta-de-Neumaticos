import { Router } from 'express'
import facturasController from '../../controllers/ventas/facturas.controller.js'

const router = Router()

router.get('/', facturasController.getAllFacturas)
router.get('/tabla', facturasController.getTableFacturas)
router.get('/codigo/:codigo', facturasController.getFacturaByCodigo)
router.get('/:id', facturasController.getFactura)
router.post('/', facturasController.postFactura)
router.put('/:id', facturasController.updateFactura)
router.patch('/:id/estado', facturasController.updateEstadoFactura)
router.delete('/:id', facturasController.deleteFactura)

export default router