import { Router } from 'express'
import ordPagoController from '../../controllers/compras/ordenesPago.controller.js'

const router = Router()

router.get('/', ordPagoController.getAllOrdPago)
router.get('/tabla', ordPagoController.getTableOrdPago)
router.get('/:id', ordPagoController.getOrdPago)
router.get('/codigo/:codigo', ordPagoController.getOrdPagoByCodigo)
router.post('/', ordPagoController.postOrdPago)
router.put('/:id', ordPagoController.updateOrdPago)
router.delete('/:id', ordPagoController.deleteOrdPago)

export default router