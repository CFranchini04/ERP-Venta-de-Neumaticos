import ordenesCompraService from '../../services/compras/ordenesCompra.service.js'

const listarOrdenesCompra = async (req, res) => {
  try {
    const ordenes = await ordenesCompraService.getAllOrdCompra()
    res.status(200).json({
      message: 'Ordenes de compra obtenidas',
      ordenes
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const obtenerOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params
    const orden = await ordenesCompraService.getOrdCompra(id)
    res.status(200).json({
      message: 'Orden de compra obtenida',
      orden
    })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerDetalleOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params
    const detalle = await ordenesCompraService.getDetalleOrdCompra(id)
    res.status(200).json({
      message: 'Detalle de orden obtenido',
      detalle
    })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerOrdenCompraCompleta = async (req, res) => {
  try {
    const { id } = req.params
    const orden = await ordenesCompraService.getOrdCompra(id)
    res.status(200).json({
      message: 'Orden de compra completa obtenida',
      orden
    })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerFacturasOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params
    const facturas = await ordenesCompraService.getFacturasOrdCompra(id)
    res.status(200).json({
      message: 'Facturas obtenidas',
      facturas
    })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

export default {
  listarOrdenesCompra,
  obtenerOrdenCompra,
  obtenerDetalleOrdenCompra,
  obtenerOrdenCompraCompleta,
  obtenerFacturasOrdenCompra
}
