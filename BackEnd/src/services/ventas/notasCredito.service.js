import supabase from '../../config/supabase.js'

const SELECT_FULL = `
  *,
  estados(nombre),
  detalles_notas_credito_ventas(
    *,
    productos(
      nombre,
      codigo,
      descripcion,
      precio_venta,
      marcas(nombre),
      inventarios(cantidad, stock_minimo, stock_maximo)
    )
  )
`

const SELECT_SINGLE = `
  *,
  estados(nombre),
  facturas_ventas(codigo_factura, clientes(personas(nombre, apellido))),
  detalles_notas_credito_ventas(
    *,
    productos(
      nombre,
      codigo,
      descripcion,
      precio_venta,
      marcas(nombre),
      inventarios(cantidad, stock_minimo, stock_maximo)
    )
  )
`

const getAllNC = async () => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .select(SELECT_FULL)
    if (error) throw new Error(error.message)
    return data
}

const getNC = async (id) => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .select(SELECT_SINGLE)
        .eq('id_nota_credito_venta', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getNCByCodigo = async (nro_nota_credito) => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .select(SELECT_SINGLE)
        .eq('nro_nota_credito', nro_nota_credito)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getNCByFacturaId = async (id_factura_venta) => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .select(SELECT_FULL)
        .eq('id_factura_venta', id_factura_venta)
    if (error) throw new Error(error.message)
    return data
}

const getNCByFacturaCodigo = async (codigo_factura) => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .select(SELECT_FULL)
        .eq('facturas_ventas.codigo_factura', codigo_factura)
    if (error) throw new Error(error.message)
    return data
}

const getTableNC = async () => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .select(`
      id_nota_credito_venta,
      nro_nota_credito,
      fecha_emision,
      monto_total,
      estados(nombre)
    `)
    if (error) throw new Error(error.message)
    return data
}

const postNC = async (id_factura_venta, nro_nota_credito, timbrado, fecha_emision, monto_total, motivo, id_estado, detalles) => {
    const { data: nc, error } = await supabase
        .from('notas_credito_ventas')
        .insert({ id_factura_venta, nro_nota_credito, timbrado, fecha_emision, monto_total, motivo, id_estado })
        .select()
        .single()
    if (error) throw new Error(error.message)

    const detallesConId = detalles.map(d => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        id_nota_credito_venta: nc.id_nota_credito_venta
    }))

    const { data: detallesCreados, error: errorDetalles } = await supabase
        .from('detalles_notas_credito_ventas')
        .insert(detallesConId)
        .select()
    if (errorDetalles) throw new Error(errorDetalles.message)

    return { nc, detalles: detallesCreados }
}

const updateNC = async (id, datos) => {
    const { detalles, ...datosNC } = datos

    const actualizarNC = Object.fromEntries(
        Object.entries(datosNC).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: nc, error } = await supabase
        .from('notas_credito_ventas')
        .update(actualizarNC)
        .eq('id_nota_credito_venta', id)
        .select()
        .single()
    if (error) throw new Error(error.message)

    if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
            const { id_detalle_nc, ...datosDetalle } = detalle
            const { error: errorDetalle } = await supabase
                .from('detalles_notas_credito_ventas')
                .update(datosDetalle)
                .eq('id_detalle_nc', id_detalle_nc)
            if (errorDetalle) throw new Error(errorDetalle.message)
        }
    }

    return nc
}

const updateEstadoNC = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('notas_credito_ventas')
        .update({ id_estado })
        .eq('id_nota_credito_venta', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const deleteNC = async (id) => {
    const { error: errorDetalles } = await supabase
        .from('detalles_notas_credito_ventas')
        .delete()
        .eq('id_nota_credito_venta', id)
    if (errorDetalles) throw new Error(errorDetalles.message)

    const { error } = await supabase
        .from('notas_credito_ventas')
        .delete()
        .eq('id_nota_credito_venta', id)
    if (error) throw new Error(error.message)

    return { message: 'Nota de crédito eliminada correctamente' }
}

export default { getAllNC, getNC, getNCByCodigo, getNCByFacturaId, getNCByFacturaCodigo, getTableNC, postNC, updateNC, updateEstadoNC, deleteNC }