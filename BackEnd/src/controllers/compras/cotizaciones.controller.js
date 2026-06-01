import cotizacionesService from '../../services/compras/cotizaciones.service.js'

const getAllCotizaciones = async (req, res) => {
    try {
        const cotizaciones = await cotizacionesService.getAllCotizaciones()
        res.status(200).json(cotizaciones)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getCotizacion = async (req, res) => {
    try {
        const { id } = req.params
        const cotizacion = await cotizacionesService.getCotizacion(id)
        res.status(200).json(cotizacion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getCotizacionByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params
        const cotizacion = await cotizacionesService.getCotizacionByCodigo(codigo)
        res.status(200).json(cotizacion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTableCotizaciones = async (req, res) => {
    try {
        const tabla = await cotizacionesService.getTableCotizaciones()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postCotizacion = async (req, res) => {
    try {
        const { id_pedido, id_proveedor, id_estado, detalles } = req.body
        if (!id_pedido || !id_estado)
            return res.status(400).json({ message: 'Faltan datos requeridos: id_pedido, id_estado' })
        if (!detalles || detalles.length === 0)
            return res.status(400).json({ message: 'Debe incluir al menos un detalle' })
        const cotizacion = await cotizacionesService.postCotizacion(id_pedido, id_proveedor, id_estado, detalles)
        res.status(201).json(cotizacion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// POST /api/compras/cotizaciones/:id/detalle
// Agrega filas a cotizaciones_proveedores_detalle para la cotizacion existente
const addDetallesToCotizacion = async (req, res) => {
    try {
        const { id } = req.params
        const { detalles } = req.body
        if (!id) return res.status(400).json({ message: 'Id de cotizacion requerido' })
        if (!detalles || detalles.length === 0)
            return res.status(400).json({ message: 'Debe incluir al menos un detalle' })
        const result = await cotizacionesService.addDetallesToCotizacion(Number(id), detalles)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateCotizacion = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const cotizacion = await cotizacionesService.updateCotizacion(id, datos)
        res.status(200).json(cotizacion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEstadoCotizacion = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado } = req.body
        if (!id || !id_estado) return res.status(400).json({ message: 'Id y estado requeridos' })
        const cotizacion = await cotizacionesService.updateEstadoCotizacion(id, id_estado)
        res.status(200).json(cotizacion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteCotizacion = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await cotizacionesService.deleteCotizacion(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllCotizaciones, getCotizacion, getCotizacionByCodigo, getTableCotizaciones, postCotizacion, addDetallesToCotizacion, updateCotizacion, updateEstadoCotizacion, deleteCotizacion }
