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

const postProducto = async (req, res) => {
    try {
        const {  nombre, codigo, descripcion, precio_compra, precio_venta, stock_minimo, stock_maximo, id_marca, id_categoria } = req.body

        if (!nombre || !id_marca)
            return res.status(400).json({ message: 'Nombre y marca son requeridos' })

        const producto = await productosService.postProducto({
            nombre, codigo, descripcion,
            precio_compra, precio_venta,
            stock_minimo, stock_maximo,
            id_marca, id_categoria
        })

        res.status(201).json(producto)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getAllMarcas = async (req, res) => {
    try {
        const marcas = await productosService.getAllMarcas()
        res.status(200).json(marcas)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getAllCategorias = async (req, res) => {
    try {
        const categorias = await productosService.getAllCategorias()
        res.status(200).json(categorias)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { searchProductos, getProducto, postProducto, getAllMarcas, getAllCategorias }