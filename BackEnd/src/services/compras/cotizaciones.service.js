// cotizaciones.service.js
// Sin cambios respecto al original: ya tiene postCotizacion con el formato correcto.
// Se incluye aquí solo para referencia de la estructura que usa el modal.
//
// El modal CargarCotizacionModal hace POST a /api/compras/cotizaciones con:
// {
//   id_pedido: number,
//   id_proveedor: number,
//   fecha_respuesta: "YYYY-MM-DD",
//   observacion: string | null,
//   id_estado: number,
//   codigo_cotizacion: string,
//   detalles: [
//     {
//       id_producto: number,
//       cantidad: number,
//       precio_unitario: number,
//       es_mejor_opcion: boolean,
//       observacion: string | null,
//     }
//   ]
// }
//
// El service inserta en cotizaciones_proveedores y luego en
// cotizaciones_proveedores_detalle (con subtotal calculado en BD).
// No requiere ninguna modificación.

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
    // 1. Crear la cabecera de la cotización
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones_proveedores')
        .insert({ id_pedido, id_proveedor, fecha_respuesta, observacion, id_estado, codigo_cotizacion })
        .select()
        .single()
    if (error) throw new Error(error.message)

    // 2. Crear los detalles apuntando a la cotización creada
    const detallesConId = detalles.map(d => ({
        id_producto:      d.id_producto,
        cantidad:         d.cantidad,
        precio_unitario:  d.precio_unitario,
        es_mejor_opcion:  d.es_mejor_opcion ?? false,
        observacion:      d.observacion,
        id_cotizacion:    cotizacion.id_cotizacion
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

export default {
    getAllCotizaciones,
    getCotizacion,
    getCotizacionByCodigo,
    getTableCotizaciones,
    postCotizacion,
    updateCotizacion,
    updateEstadoCotizacion,
    deleteCotizacion
}