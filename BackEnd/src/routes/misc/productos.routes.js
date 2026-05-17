import { Router } from 'express'
import productosController from '../../controllers/misc/productos.controller.js'

const router = Router()

router.get('/', productosController.searchProductos)
router.get('/:id', productosController.getProducto)

export default router