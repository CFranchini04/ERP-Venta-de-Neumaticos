import salariosService from '../../services/rrhh/salarios.service.js'

// ─── PROCESOS DE PAGO ───────────────────────────────────────────

const getAllProcesos = async (req, res) => {
    try {
        const procesos = await salariosService.getAllProcesos()
        res.status(200).json(procesos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getProceso = async (req, res) => {
    try {
        const { id } = req.params
        const proceso = await salariosService.getProceso(id)
        res.status(200).json(proceso)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postProceso = async (req, res) => {
    try {
        const { mes_año, tipo_proceso, fecha_alta, id_estado } = req.body
        if (!mes_año || !tipo_proceso)
            return res.status(400).json({ message: 'Faltan datos requeridos' })
        const proceso = await salariosService.postProceso(mes_año, tipo_proceso, fecha_alta, id_estado)
        res.status(201).json(proceso)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEstadoProceso = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado } = req.body
        if (!id || !id_estado) return res.status(400).json({ message: 'Id y estado requeridos' })
        const proceso = await salariosService.updateEstadoProceso(id, id_estado)
        res.status(200).json(proceso)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// ─── PAGOS EMPLEADOS ────────────────────────────────────────────

const getAllPagos = async (req, res) => {
    try {
        const pagos = await salariosService.getAllPagos()
        res.status(200).json(pagos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getPago = async (req, res) => {
    try {
        const { id } = req.params
        const pago = await salariosService.getPago(id)
        res.status(200).json(pago)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getPagosByEmpleado = async (req, res) => {
    try {
        const { id } = req.params
        const pagos = await salariosService.getPagosByEmpleado(id)
        res.status(200).json(pagos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getPagosByProceso = async (req, res) => {
    try {
        const { id } = req.params
        const pagos = await salariosService.getPagosByProceso(id)
        res.status(200).json(pagos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTablePagos = async (req, res) => {
    try {
        const tabla = await salariosService.getTablePagos()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postPago = async (req, res) => {
    try {
        const { id_pdp, id_empleado, total_ingresos, total_deducciones, neto_pagado, fecha_pago, id_estado, detalles } = req.body

        if (!id_pdp || !id_empleado || !id_estado)
            return res.status(400).json({ message: 'Faltan datos requeridos' })

        if (!detalles || detalles.length === 0)
            return res.status(400).json({ message: 'Debe incluir al menos un concepto' })

        const pago = await salariosService.postPago(id_pdp, id_empleado, total_ingresos, total_deducciones, neto_pagado, fecha_pago, id_estado, detalles)
        res.status(201).json(pago)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updatePago = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const pago = await salariosService.updatePago(id, datos)
        res.status(200).json(pago)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEstadoPago = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado } = req.body
        if (!id || !id_estado) return res.status(400).json({ message: 'Id y estado requeridos' })
        const pago = await salariosService.updateEstadoPago(id, id_estado)
        res.status(200).json(pago)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deletePago = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await salariosService.deletePago(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// ─── PHC ────────────────────────────────────────────────────────

const getSalarioEmpleado = async (req, res) => {
    try {
        const { id } = req.params
        const salario = await salariosService.getSalarioEmpleado(id)
        res.status(200).json(salario)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllProcesos, getProceso, postProceso, updateEstadoProceso, getAllPagos, getPago, getPagosByEmpleado, getPagosByProceso, getTablePagos, postPago, updatePago, updateEstadoPago, deletePago, getSalarioEmpleado }