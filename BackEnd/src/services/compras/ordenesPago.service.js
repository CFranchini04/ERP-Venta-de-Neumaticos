import supabase from '../../config/supabase.js'

const getAllOrdPago = async () => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('*, proveedores(*, personas(*)), estados(nombre), detalles_orden_pago(*, facturas_compras(*), metodos_de_pago(*))')
    if (error) throw new Error(error.message)
    return data
}

const getOrdPago = async (id) => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('*, proveedores(*, personas(*)), estados(nombre), detalles_orden_pago(*, facturas_compras(*), metodos_de_pago(*))')
        .eq('id_orden_pago', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getOrdPagoByCodigo = async (codigo) => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('*, proveedores(*, personas(*)), estados(nombre), detalles_orden_pago(*, facturas_compras(*), metodos_de_pago(*))')
        .eq('codigo_orden_pago', codigo)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getTableOrdPago = async () => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('codigo_orden_pago, fecha_creacion, estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}

const postOrdPago = async (fecha_creacion, monto_total, id_proveedor, codigo_orden_pago, id_estado, detalles) => {
    const { data: orden, error: errorOrden } = await supabase
        .from('ordenes_pago')
        .insert({ fecha_creacion, monto_total, id_proveedor, codigo_orden_pago, id_estado })
        .select()
        .single()
    if (errorOrden) throw new Error(errorOrden.message)

    const detallesConId = detalles.map(d => ({
        id_factura_compa: d.id_factura_compa,
        id_metodo_pago: d.id_metodo_pago,
        monto: d.monto,
        id_orden_pago: orden.id_orden_pago
    }))

    const { data: detallesCreados, error: errorDetalles } = await supabase
        .from('detalles_orden_pago')
        .insert(detallesConId)
        .select()
    if (errorDetalles) throw new Error(errorDetalles.message)

    return { orden, detalles: detallesCreados }
}

const updateOrdPago = async (id, data) => {
    const { detalles, ...datosOrden } = data

    const actualizarOrden = Object.fromEntries(
        Object.entries(datosOrden).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: orden, error: errorOrden } = await supabase
        .from('ordenes_pago')
        .update(actualizarOrden)
        .eq('id_orden_pago', id)
        .select()
        .single()
    if (errorOrden) throw new Error(errorOrden.message)

    if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
            const { id_d_orden_pago, ...datosDetalle } = detalle
            const { error: errorDetalle } = await supabase
                .from('detalles_orden_pago')
                .update(datosDetalle)
                .eq('id_d_orden_pago', id_d_orden_pago)
            if (errorDetalle) throw new Error(errorDetalle.message)
        }
    }

    return orden
}

const deleteOrdPago = async (id) => {
    const { error: errorDetalles } = await supabase
        .from('detalles_orden_pago')
        .delete()
        .eq('id_orden_pago', id)
    if (errorDetalles) throw new Error(errorDetalles.message)

    const { error: errorOrden } = await supabase
        .from('ordenes_pago')
        .delete()
        .eq('id_orden_pago', id)
    if (errorOrden) throw new Error(errorOrden.message)

    return { message: 'Orden de pago eliminada correctamente' }
}

export default { getAllOrdPago, getOrdPago, getOrdPagoByCodigo, getTableOrdPago, postOrdPago, updateOrdPago, deleteOrdPago }