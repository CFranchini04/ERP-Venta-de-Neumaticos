import { Router } from 'express'
import empleadosController from '../../controllers/rrhh/empleados.controller.js'

const router = Router()

router.get('/', empleadosController.getAllEmpleados)
router.get('/cargos', empleadosController.getAllCargos)
router.get('/table', empleadosController.getTableEmpleado)
router.get('/nombre/:nombre', empleadosController.getEmpleadoByNombre)
router.get('/ci/:ci', empleadosController.getEmpleadoByCi)
router.get('/ruc/:ruc', empleadosController.getEmpleadoByRuc)
router.get('/:id', empleadosController.getEmpleado)
router.post('/', empleadosController.postEmpleado)
router.put('/:id', empleadosController.updateEmpleado)
router.delete('/:id', empleadosController.deleteEmpleado)

export default router