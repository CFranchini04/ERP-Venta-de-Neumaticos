import supabase from '../../config/supabase.js'

const formatMoney = (value) => {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

const normalize = (value) => (value ?? '').toString().trim()

const getEstadoNombre = async (idEstado) => {
  if (idEstado === null || idEstado === undefined) return ''
  const { data, error } = await supabase
    .from('estados')
    .select('nombre')
    .eq('id_estado', idEstado)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return normalize(data?.nombre)
}

const getPersonaNombreByProveedor = async (idProveedor) => {
  if (idProveedor === null || idProveedor === undefined) return ''
  const { data: proveedor, error: errorProv } = await supabase
    .from('proveedores')
    .select('id_persona')
    .eq('id_proveedor', idProveedor)
    .maybeSingle()
  if (errorProv) throw new Error(errorProv.message)
  if (!proveedor?.id_persona) return ''

  const { data: persona, error: errorPersona } = await supabase
    .from('personas')
    .select('nombre,apellido')
    .eq('id_persona', proveedor.id_persona)
    .maybeSingle()
  if (errorPersona) throw new Error(errorPersona.message)
  return normalize(`${persona?.nombre ?? ''} ${persona?.apellido ?? ''}`)
}

const getProductoInfo = async (idProducto) => {
  if (idProducto === null || idProducto === undefined) {
    return { producto: 'Sin producto', categoria: '-', marca: '-' }
  }

  const { data: producto, error: errorProducto } = await supabase
    .from('productos')
    .select('nombre,id_categoria,id_marca')
    .eq('id_producto', idProducto)
    .maybeSingle()

  if (errorProducto) throw new Error(errorProducto.message)
  if (!producto) return { producto: `ID ${idProducto}`, categoria: '-', marca: '-' }

  const { data: categoria } = producto.id_categoria
    ? await supabase.from('categorias_productos').select('nombre').eq('id_categoria', producto.id_categoria).maybeSingle()
    : { data: null }

  const { data: marca } = producto.id_marca
    ? await supabase.from('marcas').select('nombre').eq('id_marca', producto.id_marca).maybeSingle()
    : { data: null }

  return {
    producto: normalize(producto.nombre) || `ID ${idProducto}`,
    categoria: normalize(categoria?.nombre) || '-',
    marca: normalize(marca?.nombre) || '-'
  }
}

const getAllOrdCompra = async () => {
  const { data: ordenes, error } = await supabase
    .from('ordenes_compras')
    .select('id_orden,id_proveedor,fecha,nro_orden,id_estado,codigo_orden')
    .order('id_orden', { ascending: false })

  if (error) throw new Error(error.message)

  return Promise.all((ordenes || []).map(async (orden) => ({
    id: orden.id_orden,
    id_orden: orden.id_orden,
    id_estado: orden.id_estado,
    id_proveedor: orden.id_proveedor,
    codigo: orden.codigo_orden ?? '',
    fecha: orden.fecha ?? '',
    proveedor: await getPersonaNombreByProveedor(orden.id_proveedor),
    estado: await getEstadoNombre(orden.id_estado),
    nro_orden: orden.nro_orden ?? null
  })))
}

const getOrdCompra = async (id) => {
  const ordenId = Number(id)
  if (!Number.isInteger(ordenId)) throw new Error('ID de orden inválido')

  const { data: orden, error } = await supabase
    .from('ordenes_compras')
    .select('id_orden,id_proveedor,fecha,nro_orden,id_estado,codigo_orden')
    .eq('id_orden', ordenId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!orden) throw new Error('Orden no encontrada')

  const { data: detalleRows, error: detalleError } = await supabase
    .from('ordenes_compras_detalle')
    .select('id_orden_compra_detalle,id_orden,id_producto,cantidad_solicitada,cantidad_recibida,precio_unitario,subtotal,observacion,id_estado')
    .eq('id_orden', ordenId)
    .order('id_orden_compra_detalle', { ascending: true })

  if (detalleError) throw new Error(detalleError.message)


const { data: facturaRows, error: facturaError } = await supabase
  .from('facturas_compras')
  .select(`
    id_factura_compra, id_proveedor, id_orden_compra, timbrado,
    nro_factura, fecha_emision, importe_total, fecha_vencimiento,
    id_estado, codigo_factura,
    detalles_facturas_compras(
      id_detalle_compra, id_producto, cantidad,
      precio_unitario, id_orden_compra_detalle
    )
  `)
  .eq('id_orden_compra', ordenId)
  .order('id_factura_compra', { ascending: true })

  if (facturaError) throw new Error(facturaError.message)

  const detalle = await Promise.all((detalleRows || []).map(async (item) => {
    const infoProducto = await getProductoInfo(item.id_producto)
    return {
      id: item.id_orden_compra_detalle,
      id_orden_compra_detalle: item.id_orden_compra_detalle,
      id_orden: item.id_orden,
      id_producto: item.id_producto,
      id_estado: item.id_estado,
      producto: infoProducto.producto,
      categoria: infoProducto.categoria,
      marca: infoProducto.marca,
      estado: await getEstadoNombre(item.id_estado),
      cantidad: Number(item.cantidad_solicitada ?? 0),
      cantidad_recibida: Number(item.cantidad_recibida ?? 0),
      precio: formatMoney(item.precio_unitario),
      total: formatMoney(item.subtotal),
      observacion: item.observacion ?? '',
      acciones: item.id_orden_compra_detalle
    }
  }))

  const facturas = await Promise.all((facturaRows || []).map(async (factura) => ({
    id: factura.id_factura_compra,
    id_factura_compra: factura.id_factura_compra,
    id_proveedor: factura.id_proveedor,
    id_estado: factura.id_estado,
    codigo: factura.codigo_factura ?? '',
    proveedor: await getPersonaNombreByProveedor(factura.id_proveedor),
    nro_factura: factura.nro_factura ?? '',
    fecha_emision: factura.fecha_emision ?? '',
    fecha_vencimiento: factura.fecha_vencimiento ?? '',
    estado: await getEstadoNombre(factura.id_estado),
    importe_total: formatMoney(factura.importe_total),
    detalles_facturas_compras: factura.detalles_facturas_compras || []
  })))

  return {
    id: orden.id_orden,
    id_orden: orden.id_orden,
    id_estado: orden.id_estado,
    id_proveedor: orden.id_proveedor,
    codigo: orden.codigo_orden ?? '',
    fecha: orden.fecha ?? '',
    estado: await getEstadoNombre(orden.id_estado),
    proveedor: await getPersonaNombreByProveedor(orden.id_proveedor),
    nro_orden: orden.nro_orden ?? null,
    detalle,
    facturas
  }
}

const getDetalleOrdCompra = async (id) => {
  const orden = await getOrdCompra(id)
  return orden.detalle
}

const getFacturasOrdCompra = async (id) => {
  const orden = await getOrdCompra(id)
  return orden.facturas
}

/**
 * Returns true if the given pedido already has at least one orden_compra associated
 * via cotizaciones → cotizaciones_proveedores_detalle → ordenes_compras_detalle
 */
const tieneOrdenCompraPorPedido = async (idPedido) => {
  const pedidoId = Number(idPedido)
  if (!Number.isInteger(pedidoId)) return false

  const { data: cots, error: e1 } = await supabase
    .from('cotizaciones')
    .select('id_cotizacion')
    .eq('id_pedido', pedidoId)
  if (e1 || !cots || cots.length === 0) return false

  const cotIds = cots.map((c) => c.id_cotizacion)

  const { data: dets, error: e2 } = await supabase
    .from('cotizaciones_proveedores_detalle')
    .select('id_cotizacion_detalle')
    .in('id_cotizacion', cotIds)
  if (e2 || !dets || dets.length === 0) return false

  const detIds = dets.map((d) => d.id_cotizacion_detalle)

  const { data: ordDet, error: e3 } = await supabase
    .from('ordenes_compras_detalle')
    .select('id_orden_compra_detalle')
    .in('id_cotizacion_detalle', detIds)
    .limit(1)
  if (e3) return false

  return !!(ordDet && ordDet.length > 0)
}

/**
 * Returns true if the given cotizacion already has at least one orden_compra associated
 */
const tieneOrdenCompraPorCotizacion = async (idCotizacion) => {
  const cotId = Number(idCotizacion)
  if (!Number.isInteger(cotId)) return false

  const { data: dets, error: e1 } = await supabase
    .from('cotizaciones_proveedores_detalle')
    .select('id_cotizacion_detalle')
    .eq('id_cotizacion', cotId)
  if (e1 || !dets || dets.length === 0) return false

  const detIds = dets.map((d) => d.id_cotizacion_detalle)

  const { data: ordDet, error: e2 } = await supabase
    .from('ordenes_compras_detalle')
    .select('id_orden_compra_detalle')
    .in('id_cotizacion_detalle', detIds)
    .limit(1)
  if (e2) return false

  return !!(ordDet && ordDet.length > 0)
}

// Recibe también los detalles de la orden ya insertados para crear el detalle de factura
const crearFacturaVacia = async (id_proveedor, id_orden_compra, detallesOrden = []) => {
  const { data: estadoRow } = await supabase
    .from('estados')
    .select('id_estado')
    .ilike('nombre', 'pendiente')
    .maybeSingle()

  const id_estado = estadoRow?.id_estado ?? null
  const codigo_factura = `FC-${id_orden_compra}-${id_proveedor}-${Date.now()}`

  const { data, error } = await supabase
    .from('facturas_compras')
    .insert({ id_proveedor, id_orden_compra, id_estado, codigo_factura })
    .select()
    .single()
  if (error) throw new Error(`Error creando factura placeholder: ${error.message}`)

  // Si hay detalles de orden, crear el detalle de factura con precios vacíos
  if (detallesOrden.length > 0) {
    const detallesFactura = detallesOrden.map((d) => ({
      id_factura_compra: data.id_factura_compra,
      id_producto: d.id_producto,
      cantidad: d.cantidad_solicitada,
      precio_unitario: 0,
      porcentaje_iva: 10,
      monto_iva: 0,
      id_orden_compra_detalle: d.id_orden_compra_detalle,
    }))

    const { error: errorDetFactura } = await supabase
      .from('detalles_facturas_compras')
      .insert(detallesFactura)

    if (errorDetFactura)
      throw new Error(`Error creando detalle de factura: ${errorDetFactura.message}`)
  }

  return data
}

const createOrdenCompra = async (grupos, id_estado_inicial = 1) => {
  if (!Array.isArray(grupos) || grupos.length === 0) {
    throw new Error('Se requiere al menos un grupo de proveedor')
  }

  const ordenesCreadas = []

  for (const grupo of grupos) {
    if (!grupo.id_proveedor) throw new Error('Cada grupo debe tener id_proveedor')
    if (!Array.isArray(grupo.productos) || grupo.productos.length === 0) {
      throw new Error('Cada grupo debe tener al menos un producto')
    }

    const fecha = new Date().toISOString().split('T')[0]
    const codigoOrden = `OC-${Date.now()}-${grupo.id_proveedor}`

    const { data: ordenInsertada, error: errorOrden } = await supabase
      .from('ordenes_compras')
      .insert({
        id_proveedor: grupo.id_proveedor,
        fecha,
        id_estado: id_estado_inicial,
        codigo_orden: codigoOrden,
      })
      .select('id_orden')
      .single()

    if (errorOrden) throw new Error(`Error creando orden: ${errorOrden.message}`)

    const idOrden = ordenInsertada.id_orden

    const detallesInsert = grupo.productos.map((p) => ({
      id_orden: idOrden,
      id_cotizacion_detalle: p.id_cotizacion_detalle ?? null,
      id_producto: p.id_producto,
      cantidad_solicitada: p.cantidad,
      cantidad_recibida: 0,
      precio_unitario: p.precio_unitario,
      id_estado: id_estado_inicial,
      observacion: p.observacion ?? null,
    }))

    // Se agrega .select() para obtener los IDs de los detalles insertados
    const { data: detallesInsertados, error: errorDetalle } = await supabase
      .from('ordenes_compras_detalle')
      .insert(detallesInsert)
      .select('id_orden_compra_detalle,id_producto,cantidad_solicitada')

    if (errorDetalle) throw new Error(`Error insertando detalle: ${errorDetalle.message}`)

    // Se pasan los detalles insertados para crear el detalle de la factura
    await crearFacturaVacia(grupo.id_proveedor, idOrden, detallesInsertados ?? [])

    ordenesCreadas.push(await getOrdCompra(idOrden))
  }

  return ordenesCreadas
}

export default {
  getAllOrdCompra,
  getOrdCompra,
  getDetalleOrdCompra,
  getFacturasOrdCompra,
  tieneOrdenCompraPorPedido,
  tieneOrdenCompraPorCotizacion,
  createOrdenCompra,
}
