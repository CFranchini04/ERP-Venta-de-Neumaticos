import { Router } from 'express'
import notasCreditoController from '../../controllers/compras/notasCredito.controller.js'

const router = Router()

router.get('/next-codigo', notasCreditoController.getNextCodigo)
router.get('/factura/:id_factura', notasCreditoController.getNotasByFactura)
router.post('/', notasCreditoController.createNotaCredito)

export default router