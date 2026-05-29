import { Router } from 'express'
import metodosPagoController from '../../controllers/compras/metodosPago.controller.js'

const router = Router()

router.get('/', metodosPagoController.getAllMetodosPago)

export default router
