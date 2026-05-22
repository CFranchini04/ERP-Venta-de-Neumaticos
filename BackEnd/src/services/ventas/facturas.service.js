import supabase from '../../config/supabase.js'

const SELECT_FULL = `
  *,
  clientes(*, personas(*)),
  presupuestos(*, presupuestos_detalle(*)),
  detalles_facturas_ventas(
    *,
    productos(
      *,
      marcas(nombre),
      categorias_productos(nombre)
    )
  ),
  estados(nombre),
  notas_credito_ventas(*, estados(nombre))
`

const SELECT_SINGLE = `
  *,
  clientes(personas(nombre, apellido, ruc, direccion, telefono, correo, tipo_persona)),
  presupuestos(
    fecha,
    estados(nombre),
    presupuestos_detalle(
        cantidad,
        precio_unitario,
        productos(
            nombre,
            codigo,
            descripcion,
            precio_compra,
            precio_venta,
            marcas(nombre),
            categorias_productos(nombre)
    ))),
  detalles_facturas_ventas(
    cantidad,
    precio_unitario,
    productos(
      nombre,
      codigo,
      descripcion,
      precio_compra,
      precio_venta,
      marcas(nombre),
      categorias_productos(nombre)
    )
  ),
  estados(nombre),
  notas_credito_ventas(*, estados(nombre))
`

const getAllFacturas = async () => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(SELECT_FULL)
  if (error) throw new Error(error.message)
  return data
}

const getFactura = async (id) => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(SELECT_SINGLE)
    .eq('id_factura', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const getFacturaByCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(SELECT_SINGLE)
    .eq('codigo_factura', codigo)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const getTableFacturas = async () => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(`
      id_factura,
      codigo_factura,
      fecha_emision,
      fecha_vencimiento,
      clientes(personas(nombre, apellido)),
      presupuestos(id_presupuesto),
      estados(nombre)
    `)
  if (error) throw new Error(error.message)
  return data
}

const postFactura = async (id_cliente, id_presupuesto, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura, detalles) => {
  const { data: factura, error } = await supabase
    .from('facturas_ventas')
    .insert({ id_cliente, id_presupuesto, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura })
    .select()
    .single()
  if (error) throw new Error(error.message)

  const detallesConId = detalles.map(d => ({
    id_producto: d.id_producto,
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
    id_factura: factura.id_factura
  }))

  const { data: detallesCreados, error: errorDetalles } = await supabase
    .from('detalles_facturas_ventas')
    .insert(detallesConId)
    .select()
  if (errorDetalles) throw new Error(errorDetalles.message)

  return { factura, detalles: detallesCreados }
}

const updateFactura = async (id, datos) => {
  const { detalles, ...datosFactura } = datos

  const actualizarFactura = Object.fromEntries(
    Object.entries(datosFactura).filter(([_, v]) => v !== undefined && v !== '')
  )
  const { data: factura, error } = await supabase
    .from('facturas_ventas')
    .update(actualizarFactura)
    .eq('id_factura', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (detalles && detalles.length > 0) {
    for (const detalle of detalles) {
      const { id_detalle_venta, ...datosDetalle } = detalle
      const { error: errorDetalle } = await supabase
        .from('detalles_facturas_ventas')
        .update(datosDetalle)
        .eq('id_detalle_venta', id_detalle_venta)
      if (errorDetalle) throw new Error(errorDetalle.message)
    }
  }

  return factura
}

const updateEstadoFactura = async (id, id_estado) => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .update({ id_estado })
    .eq('id_factura', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const deleteFactura = async (id) => {
  const { error: errorDetalles } = await supabase
    .from('detalles_facturas_ventas')
    .delete()
    .eq('id_factura', id)
  if (errorDetalles) throw new Error(errorDetalles.message)

  const { error: errorNotas } = await supabase
    .from('notas_credito_ventas')
    .delete()
    .eq('id_factura', id)
  if (errorNotas) throw new Error(errorNotas.message)

  const { error } = await supabase
    .from('facturas_ventas')
    .delete()
    .eq('id_factura', id)
  if (error) throw new Error(error.message)

  return { message: 'Factura eliminada correctamente' }
}

export default { getAllFacturas, getFactura, getFacturaByCodigo, getTableFacturas, postFactura, updateFactura, updateEstadoFactura, deleteFactura }