import pedidosService from '../../services/compras/pedidos.service.js'

const getAllPedidos = async (req, res) => {
    try {
        const pedidos = await pedidosService.getAllPedidos()
        res.status(200).json(pedidos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getPedidos = async (req, res) => {
    try {
        const { id } = req.params
        const pedido = await pedidosService.getPedidos(id)
        res.status(200).json(pedido)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTablePedidos = async (req, res) => {
    try {
        const tabla = await pedidosService.getTablePedidos()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// GET /api/compras/pedidos/:id/completo
// Devuelve cabecera + detalle de productos + cotizaciones del pedido
const getPedidoCompleto = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const pedido = await pedidosService.getPedidoCompleto(id)
        res.status(200).json(pedido)
    } catch (error) {
        const status = error.message === 'Pedido no encontrado' ? 404 : 400
        res.status(status).json({ message: error.message })
    }
}

const postPedido = async (req, res) => {
    try {
        const pedido = await pedidosService.postPedido(req.body)
        res.status(201).json(pedido)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postDetallePedido = async (req, res) => {
    try {
        const detalles = await pedidosService.postDetallePedido(req.body)
        res.status(201).json(detalles)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

/**
 * POST /api/compras/pedidos/:id/cotizaciones
 * Genera cotizaciones (una por proveedor) vinculadas al pedido,
 * usando los productos del detalle del pedido.
 */
const crearCotizacionesPedido = async (req, res) => {
    try {
        const { id } = req.params
        const { detalles } = req.body

        if (!id) return res.status(400).json({ message: 'Id de pedido requerido' })
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0)
            return res.status(400).json({ message: 'Se requiere el array de detalles del pedido' })

        const cotizaciones = await pedidosService.crearCotizacionesParaPedido(Number(id), detalles)
        res.status(201).json({ message: 'Cotizaciones creadas correctamente', cotizaciones })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default {
    getAllPedidos,
    getPedidos,
    getTablePedidos,
    getPedidoCompleto,
    postPedido,
    postDetallePedido,
    crearCotizacionesPedido,
}