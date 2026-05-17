import productosService from '../../services/misc/productos.services.js'

const searchProductos = async (req, res) => {
    try {
        const { search } = req.query
        const productos = await productosService.searchProductos(search || '')
        res.status(200).json(productos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getProducto = async (req, res) => {
    try {
        const { id } = req.params
        const producto = await productosService.getProducto(id)
        res.status(200).json(producto)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { searchProductos, getProducto }