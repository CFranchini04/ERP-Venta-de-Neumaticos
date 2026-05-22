import supabase from '../../config/supabase.js'

const SELECT_FULL = `
  *,
  proveedores(*, personas(*)),
  ordenes_compras(*),
  detalles_facturas_compras(
    *,
    productos(
      *,
      marcas(nombre),
      categorias_productos(nombre)
    )
  ),
  estados(nombre),
  notas_credito_compras(*, estados(nombre))
`

const SELECT_SINGLE = `
  *,
  proveedores(plazo_entrega, personas(nombre, apellido, ruc, direccion, telefono, correo, tipo_persona)),
  ordenes_compras(codigo_orden),
  detalles_facturas_compras(
    cantidad,
    precio_unitario,
    porcentaje_iva,
    monto_iva,
    subtotal,
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
  notas_credito_compras(*, estados(nombre))
`

const getAllFacturas = async () => {
    const { data, error } = await supabase
        .from('facturas_compras')
        .select(SELECT_FULL)
    if (error) throw new Error(error.message)
    return data
}

const getFactura = async (id) => {
    const { data, error } = await supabase
        .from('facturas_compras')
        .select(SELECT_SINGLE)
        .eq('id_factura_compra', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getFacturaByCodigo = async (codigo) => {
    const { data, error } = await supabase
        .from('facturas_compras')
        .select(SELECT_SINGLE)
        .eq('codigo_factura', codigo)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getTableFacturas = async () => {
    const { data, error } = await supabase
        .from('facturas_compras')
        .select(`
      codigo_factura,
      fecha_emision,
      fecha_vencimiento,
      ordenes_compras(codigo_orden),
      proveedores(personas(nombre, apellido)),
      estados(nombre)
    `)
    if (error) throw new Error(error.message)
    return data
}

const postFactura = async (id_proveedor, id_orden_compra, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura, detalles) => {
    const { data: factura, error } = await supabase
        .from('facturas_compras')
        .insert({ id_proveedor, id_orden_compra, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura })
        .select()
        .single()
    if (error) throw new Error(error.message)

    const detallesConId = detalles.map(d => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        porcentaje_iva: d.porcentaje_iva,
        monto_iva: d.monto_iva,
        id_orden_compra_detalle: d.id_orden_compra_detalle,
        id_factura_compra: factura.id_factura_compra
    }))

    const { data: detallesCreados, error: errorDetalles } = await supabase
        .from('detalles_facturas_compras')
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
        .from('facturas_compras')
        .update(actualizarFactura)
        .eq('id_factura_compra', id)
        .select()
        .single()
    if (error) throw new Error(error.message)

    if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
            const { id_detalle_compra, ...datosDetalle } = detalle
            const { error: errorDetalle } = await supabase
                .from('detalles_facturas_compras')
                .update(datosDetalle)
                .eq('id_detalle_compra', id_detalle_compra)
            if (errorDetalle) throw new Error(errorDetalle.message)
        }
    }

    return factura
}

const updateEstadoFactura = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('facturas_compras')
        .update({ id_estado })
        .eq('id_factura_compra', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const deleteFactura = async (id) => {
    const { error: errorDetalles } = await supabase
        .from('detalles_facturas_compras')
        .delete()
        .eq('id_factura_compra', id)
    if (errorDetalles) throw new Error(errorDetalles.message)

    const { error: errorNotas } = await supabase
        .from('notas_credito_compras')
        .delete()
        .eq('id_factura_compra', id)
    if (errorNotas) throw new Error(errorNotas.message)

    const { error } = await supabase
        .from('facturas_compras')
        .delete()
        .eq('id_factura_compra', id)
    if (error) throw new Error(error.message)

    return { message: 'Factura eliminada correctamente' }
}

export default { getAllFacturas, getFactura, getFacturaByCodigo, getTableFacturas, postFactura, updateFactura, updateEstadoFactura, deleteFactura }