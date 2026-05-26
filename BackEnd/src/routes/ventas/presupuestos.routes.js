import express from 'express'
import presupuestosController from '../../controllers/ventas/presupuestos.controller.js'
import productosController from '../../controllers/ventas/productos.controller.js'
import clientesController from '../../controllers/ventas/clientes.controller.js'

const router = express.Router()

router.get('/productos/search', productosController.searchProductos)
router.get('/productos/:id', productosController.getProducto)

router.get('/clientes/all', clientesController.searchClientes)
router.get('/clientes/:id', clientesController.getCliente)

router.get('/', presupuestosController.listarPresupuestos)
router.get('/:id/detalle', presupuestosController.obtenerDetallePresupuesto)
router.post('/detalle', presupuestosController.crearDetallePresupuesto)
router.get('/:id', presupuestosController.obtenerPresupuesto)
router.post('/', presupuestosController.crearPresupuesto)

export default router
