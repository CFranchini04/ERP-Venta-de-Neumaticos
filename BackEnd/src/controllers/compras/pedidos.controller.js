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

export default { getAllPedidos, getPedidos, getTablePedidos }   