import { Router } from 'express'
import pedidosController from '../../controllers/compras/pedidos.controller.js'
const router = Router()

router.get('/', pedidosController.getAllPedidos)
router.get('/tabla', pedidosController.getTablePedidos)
router.get('/:id', pedidosController.getPedidos)    

export default router;