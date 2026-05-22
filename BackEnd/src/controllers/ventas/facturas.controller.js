import facturasService from '../../services/ventas/facturas.service.js'

const getAllFacturas = async (req, res) => {
    try {
        const facturas = await facturasService.getAllFacturas()
        res.status(200).json(facturas)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getFactura = async (req, res) => {
    try {
        const { id } = req.params
        const factura = await facturasService.getFactura(id)
        res.status(200).json(factura)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getFacturaByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params
        const factura = await facturasService.getFacturaByCodigo(codigo)
        res.status(200).json(factura)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTableFacturas = async (req, res) => {
    try {
        const tabla = await facturasService.getTableFacturas()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postFactura = async (req, res) => {
    try {
        const { id_cliente, id_presupuesto, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura, detalles } = req.body

        if (!id_cliente || !nro_factura || !codigo_factura || !id_estado)
            return res.status(400).json({ message: 'Faltan datos requeridos' })

        if (!detalles || detalles.length === 0)
            return res.status(400).json({ message: 'Debe incluir al menos un detalle' })

        const factura = await facturasService.postFactura(id_cliente, id_presupuesto, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura, detalles)
        res.status(201).json(factura)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateFactura = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const factura = await facturasService.updateFactura(id, datos)
        res.status(200).json(factura)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEstadoFactura = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado } = req.body
        if (!id || !id_estado) return res.status(400).json({ message: 'Id y estado requeridos' })
        const factura = await facturasService.updateEstadoFactura(id, id_estado)
        res.status(200).json(factura)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteFactura = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await facturasService.deleteFactura(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllFacturas, getFactura, getFacturaByCodigo, getTableFacturas, postFactura, updateFactura, updateEstadoFactura, deleteFactura }