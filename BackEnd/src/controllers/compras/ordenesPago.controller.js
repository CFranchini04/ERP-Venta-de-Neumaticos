import ordPagoService from '../../services/compras/ordenesPago.service.js'

const getAllOrdPago = async (req, res) => {
    try {
        const ordenes = await ordPagoService.getAllOrdPago()
        res.status(200).json(ordenes)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getOrdPago = async (req, res) => {
    try {
        const { id } = req.params
        const orden = await ordPagoService.getOrdPago(id)
        res.status(200).json(orden)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getOrdPagoByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params
        const orden = await ordPagoService.getOrdPagoByCodigo(codigo)
        res.status(200).json(orden)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTableOrdPago = async (req, res) => {
    try {
        const tabla = await ordPagoService.getTableOrdPago()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postOrdPago = async (req, res) => {
    try {
        const { fecha_creacion, monto_total, id_proveedor, codigo_orden_pago, id_estado, detalles } = req.body

        if (!fecha_creacion || !id_proveedor || !codigo_orden_pago || !id_estado)
            return res.status(400).json({ message: 'Faltan datos requeridos' })

        if (!detalles || detalles.length === 0)
            return res.status(400).json({ message: 'Debe incluir al menos un detalle' })

        const orden = await ordPagoService.postOrdPago(fecha_creacion, monto_total, id_proveedor, codigo_orden_pago, id_estado, detalles)
        res.status(201).json(orden)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateOrdPago = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body

        if (!id) return res.status(400).json({ message: 'Id requerido' })

        const orden = await ordPagoService.updateOrdPago(id, datos)
        res.status(200).json(orden)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteOrdPago = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) return res.status(400).json({ message: 'Id requerido' })

        const resultado = await ordPagoService.deleteOrdPago(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllOrdPago, getOrdPago, getOrdPagoByCodigo, getTableOrdPago, postOrdPago, updateOrdPago, deleteOrdPago }