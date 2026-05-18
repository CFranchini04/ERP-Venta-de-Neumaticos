import supabase from '../../config/supabase.js'

const getAllCotizaciones = async () => {
    const { data, error } = await supabase
        .from('cotizaciones_proveedores')
        .select('*, proveedores(personas(nombre, apellido)), pedidos_compras(*), estados(nombre), cotizaciones_proveedores_detalle(*, productos(*))')
    if (error) throw new Error(error.message)
    return data
}

const getCotizacion = async (id) => {
    const { data, error } = await supabase
        .from('cotizaciones_proveedores')
        .select('*, proveedores(personas(nombre, apellido)), pedidos_compras(*), estados(nombre), cotizaciones_proveedores_detalle(*, productos(*))')
        .eq('id_cotizacion', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getCotizacionByCodigo = async (codigo) => {
    const { data, error } = await supabase
        .from('cotizaciones_proveedores')
        .select('*, proveedores(personas(nombre, apellido)), pedidos_compras(*), estados(nombre), cotizaciones_proveedores_detalle(*, productos(*))')
        .eq('codigo_cotizacion', codigo)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getTableCotizaciones = async () => {
    const { data, error } = await supabase
        .from('cotizaciones_proveedores')
        .select('codigo_cotizacion, fecha_respuesta, proveedores(personas(nombre, apellido)), pedidos_compras(codigo_pedido), estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}
const postCotizacion = async (id_pedido, id_proveedor, fecha_respuesta, observacion, id_estado, codigo_cotizacion, detalles) => {
    // 1. Crear la cotizacion
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones_proveedores')
        .insert({ id_pedido, id_proveedor, fecha_respuesta, observacion, id_estado, codigo_cotizacion })
        .select()
        .single()
    if (error) throw new Error(error.message)

    // 2. Crear los detalles apuntando a la cotizacion creada
    const detallesConId = detalles.map(d => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        es_mejor_opcion: d.es_mejor_opcion ?? false,
        observacion: d.observacion,
        id_cotizacion: cotizacion.id_cotizacion
    }))

    const { data: detallesCreados, error: errorDetalles } = await supabase
        .from('cotizaciones_proveedores_detalle')
        .insert(detallesConId)
        .select()
    if (errorDetalles) throw new Error(errorDetalles.message)

    return { cotizacion, detalles: detallesCreados }
}

const updateCotizacion = async (id, datos) => {
    const { detalles, ...datosCotizacion } = datos

    const actualizarCotizacion = Object.fromEntries(
        Object.entries(datosCotizacion).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones_proveedores')
        .update(actualizarCotizacion)
        .eq('id_cotizacion', id)
        .select()
        .single()
    if (error) throw new Error(error.message)

    if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
            const { id_cotizacion_detalle, ...datosDetalle } = detalle
            const { error: errorDetalle } = await supabase
                .from('cotizaciones_proveedores_detalle')
                .update(datosDetalle)
                .eq('id_cotizacion_detalle', id_cotizacion_detalle)
            if (errorDetalle) throw new Error(errorDetalle.message)
        }
    }

    return cotizacion
}

const updateEstadoCotizacion = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('cotizaciones_proveedores')
        .update({ id_estado })
        .eq('id_cotizacion', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const deleteCotizacion = async (id) => {
    const { error: errorDetalles } = await supabase
        .from('cotizaciones_proveedores_detalle')
        .delete()
        .eq('id_cotizacion', id)
    if (errorDetalles) throw new Error(errorDetalles.message)

    const { error } = await supabase
        .from('cotizaciones_proveedores')
        .delete()
        .eq('id_cotizacion', id)
    if (error) throw new Error(error.message)

    return { message: 'Cotizacion eliminada correctamente' }
}

export default { getAllCotizaciones, getCotizacion, getCotizacionByCodigo, getTableCotizaciones, postCotizacion, updateCotizacion, updateEstadoCotizacion, deleteCotizacion }