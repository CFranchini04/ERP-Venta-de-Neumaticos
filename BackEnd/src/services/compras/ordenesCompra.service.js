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
    .select('id_factura_compra,id_proveedor,id_orden_compra,timbrado,nro_factura,fecha_emision,importe_total,fecha_vencimiento,id_estado,codigo_factura')
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
    importe_total: formatMoney(factura.importe_total)
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

export default {
  getAllOrdCompra,
  getOrdCompra,
  getDetalleOrdCompra,
  getFacturasOrdCompra
}
