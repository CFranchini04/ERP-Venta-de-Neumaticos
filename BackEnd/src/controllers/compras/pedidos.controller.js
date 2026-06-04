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

// POST /api/compras/pedidos/:id/cotizaciones
// Crea UNA cabecera de cotizacion vinculada al pedido (sin detalles aun).
const crearCotizacionPedido = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id de pedido requerido' })
        const cotizacion = await pedidosService.crearCotizacionParaPedido(Number(id))
        res.status(201).json({ message: 'Cotizacion creada correctamente', cotizacion })
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
    crearCotizacionPedido,
}
