import supabase from '../../config/supabase.js'

const getAllOrdPago = async () => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('*, proveedores(*, personas(nombre)), estados(nombre), detalles_orden_pago(*, facturas_compras(*), metodos_de_pago(*))')
    if (error) throw new Error(error.message)
    return data
}

const getOrdPago = async (id) => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('*, proveedores(*, personas(nombre)), estados(nombre), detalles_orden_pago(*, facturas_compras(*), metodos_de_pago(*))')
        .eq('id_orden_pago', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getOrdPagoByCodigo = async (codigo) => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('*, proveedores(*, personas(nombre)), estados(nombre), detalles_orden_pago(*, facturas_compras(*), metodos_de_pago(*))')
        .eq('codigo_orden_pago', codigo)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getTableOrdPago = async () => {
    const { data, error } = await supabase
        .from('ordenes_pago')
        .select('codigo_orden_pago, fecha_creacion, proveedores( personas(nombre)), estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}

const postOrdPago = async (fecha_creacion, monto_total, id_proveedor, codigo_orden_pago, id_estado, detalles) => {

    // Mapa para rastrear qué id_orden_pago se usó por cada detalle
    const ordenesAfectadas = new Set()

    for (const d of detalles) {
        const { data: detalleExistente } = await supabase
            .from('detalles_orden_pago')
            .select('*, ordenes_pago(*)')
            .eq('id_factura_compra', d.id_factura_compra)
            .maybeSingle()

        if (detalleExistente) {
            await supabase
                .from('detalles_orden_pago')
                .update({
                    id_metodo_pago: d.id_metodo_pago,
                    monto: d.monto,
                })
                .eq('id_d_orden_pago', detalleExistente.id_d_orden_pago)

            await supabase
                .from('ordenes_pago')
                .update({ monto_total, id_estado })
                .eq('id_orden_pago', detalleExistente.id_orden_pago)

            // ✅ registrar orden afectada
            ordenesAfectadas.add(detalleExistente.id_orden_pago)

        } else {
            const { data: orden, error: errorOrden } = await supabase
                .from('ordenes_pago')
                .insert({ fecha_creacion, monto_total, id_proveedor, codigo_orden_pago, id_estado })
                .select()
                .single()
            if (errorOrden) throw new Error(errorOrden.message)

            const { error: errorDetalle } = await supabase
                .from('detalles_orden_pago')
                .insert({
                    id_factura_compra: d.id_factura_compra,
                    id_metodo_pago: d.id_metodo_pago,
                    monto: d.monto,
                    id_orden_pago: orden.id_orden_pago
                })
            if (errorDetalle) throw new Error(errorDetalle.message)

            // ✅ registrar orden afectada
            ordenesAfectadas.add(orden.id_orden_pago)
        }

        // Marcar factura como pagada (id_estado = 0)
        const { error: errorFactura } = await supabase
            .from('facturas_compras')
            .update({ id_estado: 0 })
            .eq('id_factura_compra', d.id_factura_compra)
        if (errorFactura) throw new Error(errorFactura.message)
    }

    // ✅ NUEVO: verificar cada orden afectada y actualizarla a pagada si todas sus facturas lo están
    for (const id_orden_pago of ordenesAfectadas) {
        // Traer todos los detalles de esta orden con el estado de su factura
        const { data: detallesOrden, error: errorDetalles } = await supabase
            .from('detalles_orden_pago')
            .select('id_factura_compra, facturas_compras(id_estado)')
            .eq('id_orden_pago', id_orden_pago)

        if (errorDetalles) throw new Error(errorDetalles.message)

        const todasPagadas = detallesOrden.every(
            (d) => d.facturas_compras?.id_estado === 0
        )

        if (todasPagadas) {
            const { error: errorOrdenFinal } = await supabase
                .from('ordenes_pago')
                .update({ id_estado: 0 })   // 0 = Pagado
                .eq('id_orden_pago', id_orden_pago)
            if (errorOrdenFinal) throw new Error(errorOrdenFinal.message)
        }
    }

    return { message: 'Orden de pago procesada correctamente' }
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