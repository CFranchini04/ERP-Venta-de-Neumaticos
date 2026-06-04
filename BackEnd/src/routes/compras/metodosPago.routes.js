import { Router } from 'express'
import metodosPagoController from '../../controllers/compras/metodosPago.controller.js'

const router = Router()

router.get('/',        metodosPagoController.getAllMetodosPago)
router.get('/:id',     metodosPagoController.getMetodoPago)
router.post('/',       metodosPagoController.createMetodoPago)
router.put('/:id',     metodosPagoController.updateMetodoPago)
router.delete('/:id',  metodosPagoController.deleteMetodoPago)

export default router