import { Router } from 'express'
import cotizacionesController from '../../controllers/compras/cotizaciones.controller.js'

const router = Router()

router.get('/', cotizacionesController.getAllCotizaciones)
router.get('/tabla', cotizacionesController.getTableCotizaciones)
router.get('/codigo/:codigo', cotizacionesController.getCotizacionByCodigo)
router.get('/:id', cotizacionesController.getCotizacion)
router.post('/', cotizacionesController.postCotizacion)
router.post('/:id/detalle', cotizacionesController.addDetallesToCotizacion)
router.put('/:id', cotizacionesController.updateCotizacion)
router.patch('/:id/estado', cotizacionesController.updateEstadoCotizacion)
router.delete('/:id', cotizacionesController.deleteCotizacion)

export default router
