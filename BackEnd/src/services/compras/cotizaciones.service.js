import supabase from '../../config/supabase.js'

const SELECT_ALL = `*, pedidos_compras(*), estados(nombre), cotizaciones_proveedores_detalle(*, proveedores(*, personas(*)), productos(*))`
const SELECT_SINGLE = `*, pedidos_compras(fecha_creacion, codigo_pedido), estados(nombre), cotizaciones_proveedores_detalle(*,proveedores(personas(nombre, apellido)), productos(*))`

const getAllCotizaciones = async () => {
    const { data, error } = await supabase
        .from('cotizaciones')
        .select(SELECT_ALL)
    if (error) throw new Error(error.message)
    return data
}

const getCotizacion = async (id) => {
    const { data, error } = await supabase
        .from('cotizaciones')
        .select(SELECT_SINGLE)
        .eq('id_cotizacion', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getCotizacionByCodigo = async (codigo) => {
    const { data, error } = await supabase
        .from('cotizaciones')
        .select(SELECT_SINGLE)
        .eq('codigo_cotizacion', codigo)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getTableCotizaciones = async () => {
    const { data, error } = await supabase
        .from('cotizaciones')
        .select('id_cotizacion, id_pedido, cotizaciones_proveedores_detalle(proveedores(personas(nombre, apellido))), pedidos_compras(codigo_pedido, fecha_creacion), estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}

const postCotizacion = async (id_pedido, id_proveedor, id_estado, detalles) => {
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .insert({ id_pedido, id_proveedor, id_estado })
        .select()
        .single()
    if (error) throw new Error(error.message)

    const detallesConId = detalles.map(d => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        es_mejor_opcion: d.es_mejor_opcion ?? false,
        observacion: d.observacion,
        id_proveedor: d.id_proveedor,
        fecha_respuesta: d.fecha_respuesta,
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
        .from('cotizaciones')
        .update(actualizarCotizacion)
        .eq('id_cotizacion', id)
        .select()
        .single()
    if (error) throw new Error(error.message)

    if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
            const { id_cotizacion_detalle, ...datosDetalle } = detalle

            const actualizarDetalle = Object.fromEntries(
                Object.entries(datosDetalle).filter(([_, v]) => v !== undefined && v !== '')
            )

            const { error: errorDetalle } = await supabase
                .from('cotizaciones_proveedores_detalle')
                .update(actualizarDetalle)
                .eq('id_cotizacion_detalle', id_cotizacion_detalle)
            if (errorDetalle) throw new Error(errorDetalle.message)
        }
    }

    return cotizacion
}

const updateEstadoCotizacion = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('cotizaciones')
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
        .from('cotizaciones')
        .delete()
        .eq('id_cotizacion', id)
    if (error) throw new Error(error.message)

    return { message: 'Cotizacion eliminada correctamente' }
}

// Inserta filas en cotizaciones_proveedores_detalle para una cotizacion existente.
// Si sobreescribir=true, elimina primero las filas existentes para cada id_proveedor involucrado.
const addDetallesToCotizacion = async (id_cotizacion, detalles, sobreescribir = false) => {
    if (sobreescribir && detalles.length > 0) {
        const proveedoresUnicos = [...new Set(detalles.map(d => d.id_proveedor))]
        for (const idProv of proveedoresUnicos) {
            const { error: delError } = await supabase
                .from('cotizaciones_proveedores_detalle')
                .delete()
                .eq('id_cotizacion', id_cotizacion)
                .eq('id_proveedor', idProv)
            if (delError) throw new Error(delError.message)
        }
    }
    const rows = detalles.map((d) => ({
        id_cotizacion,
        id_producto: d.id_producto,
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
        es_mejor_opcion: d.es_mejor_opcion ?? false,
        observacion: d.observacion ?? '',
        id_proveedor: d.id_proveedor,
        fecha_respuesta: d.fecha_respuesta,
    }))
    const { data, error } = await supabase
        .from('cotizaciones_proveedores_detalle')
        .insert(rows)
        .select()
    if (error) throw new Error(error.message)
    return data
}

export default { getAllCotizaciones, getCotizacion, getCotizacionByCodigo, getTableCotizaciones, postCotizacion, addDetallesToCotizacion, updateCotizacion, updateEstadoCotizacion, deleteCotizacion }
