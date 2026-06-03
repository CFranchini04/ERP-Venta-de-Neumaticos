import { Router } from 'express'
import pedidosController from '../../controllers/compras/pedidos.controller.js'

const router = Router()

router.get('/', pedidosController.getAllPedidos)
router.get('/tabla', pedidosController.getTablePedidos)
router.get('/:id/completo', pedidosController.getPedidoCompleto)
router.get('/:id', pedidosController.getPedidos)
router.post('/', pedidosController.postPedido)
router.post('/detalle', pedidosController.postDetallePedido)
router.post('/:id/cotizaciones', pedidosController.crearCotizacionPedido)

export default router
