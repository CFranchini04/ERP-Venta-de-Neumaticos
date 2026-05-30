import { Router } from 'express'
import ordenesCompraController from '../../controllers/compras/ordenesCompra.controller.js'

const router = Router()

router.get('/', ordenesCompraController.listarOrdenesCompra)
router.post('/', ordenesCompraController.crearOrdenCompra)
router.get('/verificar/pedido/:idPedido', ordenesCompraController.verificarOrdenPorPedido)
router.get('/verificar/cotizacion/:idCotizacion', ordenesCompraController.verificarOrdenPorCotizacion)
router.get('/:id', ordenesCompraController.obtenerOrdenCompraCompleta)
router.get('/:id/detalle', ordenesCompraController.obtenerDetalleOrdenCompra)
router.get('/:id/facturas', ordenesCompraController.obtenerFacturasOrdenCompra)

export default router
