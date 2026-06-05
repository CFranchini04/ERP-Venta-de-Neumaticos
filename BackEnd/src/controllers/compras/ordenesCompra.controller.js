import ordenesCompraService from '../../services/compras/ordenesCompra.service.js'
import cotizacionesService from '../../services/compras/cotizaciones.service.js' 
import pedidosService from '../../services/compras/pedidos.service.js'     

const listarOrdenesCompra = async (req, res) => {
  try {
    const ordenes = await ordenesCompraService.getAllOrdCompra()
    res.status(200).json({ message: 'Ordenes de compra obtenidas', ordenes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const obtenerOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params
    const orden = await ordenesCompraService.getOrdCompra(id)
    res.status(200).json({ message: 'Orden de compra obtenida', orden })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerDetalleOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params
    const detalle = await ordenesCompraService.getDetalleOrdCompra(id)
    res.status(200).json({ message: 'Detalle de orden obtenido', detalle })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerOrdenCompraCompleta = async (req, res) => {
  try {
    const { id } = req.params
    const orden = await ordenesCompraService.getOrdCompra(id)
    res.status(200).json({ message: 'Orden de compra completa obtenida', orden })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerFacturasOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params
    const facturas = await ordenesCompraService.getFacturasOrdCompra(id)
    res.status(200).json({ message: 'Facturas obtenidas', facturas })
  } catch (error) {
    const status = error.message === 'Orden no encontrada' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const verificarOrdenPorPedido = async (req, res) => {
  try {
    const { idPedido } = req.params
    const tieneOrden = await ordenesCompraService.tieneOrdenCompraPorPedido(idPedido)
    res.status(200).json({ tieneOrden })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const verificarOrdenPorCotizacion = async (req, res) => {
  try {
    const { idCotizacion } = req.params
    const tieneOrden = await ordenesCompraService.tieneOrdenCompraPorCotizacion(idCotizacion)
    res.status(200).json({ tieneOrden })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const crearOrdenCompra = async (req, res) => {
  const { grupos, id_estado_inicial, id_cotizacion } = req.body
console.log('id_cotizacion recibido:', id_cotizacion)
  try {
    const { grupos, id_estado_inicial, id_cotizacion } = req.body
    if (!Array.isArray(grupos) || grupos.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un grupo de proveedor con productos' })
    }

    const ordenes = await ordenesCompraService.createOrdenCompra(grupos, id_estado_inicial)

    if (id_cotizacion) {
      const cotizacionActualizada = await cotizacionesService.updateEstadoCotizacion(id_cotizacion, 2)

      if (cotizacionActualizada?.id_pedido) {
        await pedidosService.updateEstadoPedido(cotizacionActualizada.id_pedido, 2)
      }
    }

    const n = ordenes.length
    res.status(201).json({
      message: `${n} orden${n !== 1 ? 'es' : ''} de compra creada${n !== 1 ? 's' : ''} exitosamente`,
      ordenes
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


export default {
  listarOrdenesCompra,
  obtenerOrdenCompra,
  obtenerDetalleOrdenCompra,
  obtenerOrdenCompraCompleta,
  obtenerFacturasOrdenCompra,
  verificarOrdenPorPedido,
  verificarOrdenPorCotizacion,
  crearOrdenCompra,
}
