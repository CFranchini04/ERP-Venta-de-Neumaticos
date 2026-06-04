import empleadosService from '../../services/rrhh/empleados.service.js'

const getAllEmpleados = async (req, res) => {
    try {
        const empleados = await empleadosService.getAllEmpleados()
        res.status(200).json(empleados)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTableEmpleado = async (req, res) => {
    try {
        const empleados = await empleadosService.getTableEmpleado()
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
        const {
            ci, conyugue, nro_hijos, hijos_menores,
            nombre, apellido, ruc, direccion, telefono, correo,
            tipo_persona, fecha_nacimiento,
            id_cargo, id_estado, fecha_inicio
        } = req.body

        if (!ci || !nombre)
            return res.status(400).json({ message: 'CI y nombre requeridos' })

        const empleado = await empleadosService.postEmpleado(
            ci, conyugue, nro_hijos, hijos_menores,
            nombre, apellido, ruc, direccion, telefono, correo,
            tipo_persona, fecha_nacimiento,
            id_cargo, id_estado, fecha_inicio
        )
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

const getAllCargos = async (req, res) => {
    try {
        const cargos = await empleadosService.getAllCargos()
        res.status(200).json(cargos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postCargo = async (req, res) => {
    const { nombre, jefe_inmediato, area_superior, salario } = req.body

    if (!nombre)
        return res.status(400).json({ message: 'El nombre es obligatorio' })

    try {
        const cargo = await empleadosService.postCargo(nombre, jefe_inmediato, area_superior, salario)
        return res.status(201).json(cargo)
    } catch (err) {
        console.error('Error al crear cargo:', err.message)
        return res.status(500).json({ message: err.message })
    }
}

export default { getAllEmpleados, getTableEmpleado, getEmpleado, getEmpleadoByNombre, getEmpleadoByCi, getEmpleadoByRuc, postEmpleado, updateEmpleado, deleteEmpleado, getAllCargos, postCargo }