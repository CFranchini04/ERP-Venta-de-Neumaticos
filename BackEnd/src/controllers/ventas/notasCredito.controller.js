import ncService from '../../services/ventas/notasCredito.service.js'

const getAllNC = async (req, res) => {
    try {
        const nc = await ncService.getAllNC()
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getNC = async (req, res) => {
    try {
        const { id } = req.params
        const nc = await ncService.getNC(id)
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getNCByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params
        const nc = await ncService.getNCByCodigo(codigo)
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getNCByFacturaId = async (req, res) => {
    try {
        const { id } = req.params
        const nc = await ncService.getNCByFacturaId(id)
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getNCByFacturaCodigo = async (req, res) => {
    try {
        const { codigo } = req.params
        const nc = await ncService.getNCByFacturaCodigo(codigo)
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTableNC = async (req, res) => {
    try {
        const tabla = await ncService.getTableNC()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postNC = async (req, res) => {
    try {
        const { id_factura_venta, nro_nota_credito, timbrado, fecha_emision, monto_total, motivo, id_estado, detalles } = req.body

        if (!id_factura_venta || !nro_nota_credito || !timbrado || !monto_total || !id_estado)
            return res.status(400).json({ message: 'Faltan datos requeridos' })

        if (!detalles || detalles.length === 0)
            return res.status(400).json({ message: 'Debe incluir al menos un detalle' })

        const nc = await ncService.postNC(id_factura_venta, nro_nota_credito, timbrado, fecha_emision, monto_total, motivo, id_estado, detalles)
        res.status(201).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateNC = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const nc = await ncService.updateNC(id, datos)
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEstadoNC = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado } = req.body
        if (!id || !id_estado) return res.status(400).json({ message: 'Id y estado requeridos' })
        const nc = await ncService.updateEstadoNC(id, id_estado)
        res.status(200).json(nc)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteNC = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await ncService.deleteNC(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllNC, getNC, getNCByCodigo, getNCByFacturaId, getNCByFacturaCodigo, getTableNC, postNC, updateNC, updateEstadoNC, deleteNC }