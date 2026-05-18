import { Router } from 'express'
import productosController from '../../controllers/misc/productos.controller.js'

const router = Router()

router.get('/', productosController.searchProductos)
router.get('/marcas', productosController.getAllMarcas)
router.get('/categorias', productosController.getAllCategorias)
router.get('/:id', productosController.getProducto)
router.post('/', productosController.postProducto)

export default router