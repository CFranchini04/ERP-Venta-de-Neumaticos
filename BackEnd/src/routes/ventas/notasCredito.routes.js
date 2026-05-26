import { Router } from 'express'
import ncController from '../../controllers/ventas/notasCredito.controller.js'

const router = Router()

router.get('/', ncController.getAllNC)
router.get('/tabla', ncController.getTableNC)
router.get('/codigo/:codigo', ncController.getNCByCodigo)
router.get('/factura/id/:id', ncController.getNCByFacturaId)
router.get('/factura/codigo/:codigo', ncController.getNCByFacturaCodigo)
router.get('/:id', ncController.getNC)
router.post('/', ncController.postNC)
router.put('/:id', ncController.updateNC)
router.patch('/:id/estado', ncController.updateEstadoNC)
router.delete('/:id', ncController.deleteNC)

export default router