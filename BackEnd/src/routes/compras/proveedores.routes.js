import { Router } from 'express'
import proveedoresController from '../../controllers/compras/proveedores.controller.js'

const router = Router()

router.get('/search', proveedoresController.searchProveedores)
router.get('/nombre/:nombre', proveedoresController.getProveedorByNombre)
router.get('/ruc/:ruc', proveedoresController.getProveedorByRuc)
router.get('/:id/ordenes-de-compra', proveedoresController.getOrdCompraByProveedor) 
router.get('/', proveedoresController.getAllProveedores)
router.get('/:id', proveedoresController.getProveedores)
router.post('/', proveedoresController.postProveedor)
router.put('/:id', proveedoresController.updateProveedor)
router.delete('/:id', proveedoresController.deleteProveedor)

export default router