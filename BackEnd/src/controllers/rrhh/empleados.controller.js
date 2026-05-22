import empleadosService from '../../services/rrhh/empleados.service.js'

const getAllEmpleados = async (req, res) => {
    try {
        const empleados = await empleadosService.getAllEmpleados()
        res.status(200).json(empleados)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getEmpleado = async (req, res) => {
    try {
        const { id } = req.params
        const empleado = await empleadosService.getEmpleado(id)
        res.status(200).json(empleado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getEmpleadoByNombre = async (req, res) => {
    try {
        const { nombre } = req.params
        const empleados = await empleadosService.getEmpleadoByNombre(nombre)
        res.status(200).json(empleados)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getEmpleadoByCi = async (req, res) => {
    try {
        const { ci } = req.params
        const empleado = await empleadosService.getEmpleadoByCi(ci)
        res.status(200).json(empleado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getEmpleadoByRuc = async (req, res) => {
    try {
        const { ruc } = req.params
        const empleado = await empleadosService.getEmpleadoByRuc(ruc)
        res.status(200).json(empleado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postEmpleado = async (req, res) => {
    try {
        const { ci, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento } = req.body

        if (!ci || !nombre)
            return res.status(400).json({ message: 'CI y nombre requeridos' })

        const empleado = await empleadosService.postEmpleado(ci, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento)
        res.status(201).json(empleado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const empleado = await empleadosService.updateEmpleado(id, datos)
        res.status(200).json(empleado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await empleadosService.deleteEmpleado(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllEmpleados, getEmpleado, getEmpleadoByNombre, getEmpleadoByCi, getEmpleadoByRuc, postEmpleado, updateEmpleado, deleteEmpleado }