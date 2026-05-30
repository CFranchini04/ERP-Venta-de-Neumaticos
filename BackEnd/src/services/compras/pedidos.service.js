import supabase from '../../config/supabase.js'

const getAllPedidos = async () => {
    const { data, error } = await supabase
        .from('pedidos_compras')
        .select('*')
    if (error) throw new Error(error.message)
    return data
}

const getPedidos = async (id) => {
    const { data, error } = await supabase
        .from('pedidos_compras')
        .select('*')
        .eq('id_pedido', id)
    if (error) throw new Error(error.message)
    return data
}

const getTablePedidos = async () => {
    const { data, error } = await supabase
        .from('pedidos_compras')
        .select('id_pedido, codigo_pedido, fecha, estados(nombre)')
    if (error) throw new Error(error.message)

    // Normalizamos el campo fecha -> fecha_creacion para el frontend
    return (data || []).map(p => ({
        ...p,
        fecha_creacion: p.fecha,
    }))
}

// Retorna cabecera + detalle de productos del pedido
const getPedidoCompleto = async (id) => {
    // 1. Cabecera del pedido
    const { data: pedido, error: errPedido } = await supabase
        .from('pedidos_compras')
        .select('id_pedido, codigo_pedido, fecha, precio_total, estados(nombre)')
        .eq('id_pedido', id)
        .single()
    if (errPedido) throw new Error(errPedido.message)
    if (!pedido) throw new Error('Pedido no encontrado')

    // 2. Detalle (productos) del pedido
    const { data: detalle, error: errDetalle } = await supabase
        .from('pedidos_compras_detalle')
        .select(`
            id_pedido_compra_detalle,
            cantidad,
            precio,
            id_estado,
            estados(nombre),
            productos(
                id_producto,
                nombre,
                stock_actual,
                inventarios(cantidad),
                marcas(nombre),
                categorias_productos(nombre)
            )
        `)
        .eq('id_pedido_compra', id)
    if (errDetalle) throw new Error(errDetalle.message)

    // 3. Cotizaciones asociadas al pedido (con sus detalles)
    const { data: cotizaciones, error: errCot } = await supabase
        .from('cotizaciones_proveedores')
        .select(`
            id_cotizacion,
            codigo_cotizacion,
            fecha_respuesta,
            observacion,
            estados(nombre),
            proveedores(
                personas(nombre, apellido)
            ),
            cotizaciones_proveedores_detalle(
                id_cotizacion_detalle,
                cantidad,
                precio_unitario,
                subtotal,
                es_mejor_opcion,
                observacion,
                productos(
                    id_producto,
                    nombre
                )
            )
        `)
        .eq('id_pedido', id)
    if (errCot) throw new Error(errCot.message)

    // Mapear detalle a formato consistente
    const detalleMapeado = (detalle || []).map((d) => ({
        id: d.id_pedido_compra_detalle,
        id_producto: d.productos?.id_producto ?? null,
        producto: d.productos?.nombre ?? '—',
        categoria: d.productos?.categorias_productos?.nombre ?? '—',
        marca: d.productos?.marcas?.nombre ?? '—',
        inventario: d.productos?.inventarios?.[0]?.cantidad ?? d.productos?.stock_actual ?? 0,
        cantidad: Number(d.cantidad ?? 0),
        precio: Number(d.precio ?? 0),
        subtotal: Number(d.cantidad ?? 0) * Number(d.precio ?? 0),
        estado: d.estados?.nombre ?? '—',
    }))

    // Mapear cotizaciones a formato consistente
    const cotizacionesMapeadas = (cotizaciones || []).map((c) => ({
        id_cotizacion: c.id_cotizacion,
        codigo_cotizacion: c.codigo_cotizacion ?? '—',
        fecha_respuesta: c.fecha_respuesta ?? '—',
        observacion: c.observacion ?? '',
        estado: c.estados?.nombre ?? '—',
        proveedor: c.proveedores?.personas
            ? `${c.proveedores.personas.nombre ?? ''} ${c.proveedores.personas.apellido ?? ''}`.trim()
            : '—',
        detalle: (c.cotizaciones_proveedores_detalle || []).map((cd) => ({
            id_cotizacion_detalle: cd.id_cotizacion_detalle,
            id_producto: cd.productos?.id_producto ?? null,
            producto: cd.productos?.nombre ?? '—',
            cantidad: Number(cd.cantidad ?? 0),
            precio_unitario: Number(cd.precio_unitario ?? 0),
            subtotal: Number(cd.subtotal ?? 0),
            es_mejor_opcion: cd.es_mejor_opcion ?? false,
            observacion: cd.observacion ?? '',
        })),
    }))

    return {
        ...pedido,
        fecha_creacion: pedido.fecha,
        estado: pedido.estados?.nombre ?? '—',
        detalle: detalleMapeado,
        cotizaciones: cotizacionesMapeadas,
    }
}

const postPedido = async ({ fecha_creacion, precio_total, id_estado, codigo_pedido }) => {
    // La columna en BD se llama "fecha", no "fecha_creacion"
    const { data, error } = await supabase
        .from('pedidos_compras')
        .insert({ fecha: fecha_creacion, precio_total, id_estado, codigo_pedido })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const postDetallePedido = async (detalles) => {
    const { data, error } = await supabase
        .from('pedidos_compras_detalle')
        .insert(detalles)
        .select()
    if (error) throw new Error(error.message)
    return data
}

/**
 * Crea una cotización abierta (sin proveedor asignado aún) para cada proveedor
 * disponible, o una cotización genérica vinculada al pedido con los productos
 * del detalle para que los proveedores puedan completar precios.
 *
 * Estrategia: se crea UNA cabecera de cotización por pedido (sin proveedor
 * definido todavía, id_proveedor se asignará luego) con los detalles del pedido.
 * precio_unitario arranca en 0 a la espera de que el proveedor cotice.
 *
 * Como cotizaciones_proveedores requiere id_proveedor NOT NULL, se busca el
 * primer proveedor disponible como placeholder. Si no hay proveedores, se omite.
 */
const crearCotizacionesParaPedido = async (idPedido, detallesPedido) => {
    // 1. Obtener todos los proveedores disponibles
    const { data: proveedores, error: errProv } = await supabase
        .from('proveedores')
        .select('id_proveedor')
    if (errProv) throw new Error(errProv.message)
    if (!proveedores || proveedores.length === 0) return []

    const hoy = new Date().toISOString().split('T')[0]
    const resultados = []

    // 2. Crear UNA cotización por proveedor, con los productos del pedido
    for (const proveedor of proveedores) {
        const codigoCotizacion = `COT_PED${idPedido}_PROV${proveedor.id_proveedor}_${Date.now()}`

        // Buscar id_estado "En Espera" o usar 1 como fallback
        const { data: estadoData } = await supabase
            .from('estados')
            .select('id_estado')
            .eq('nombre', 'En Espera')
            .maybeSingle()
        const idEstado = estadoData?.id_estado ?? 1

        const { data: cotizacion, error: errCot } = await supabase
            .from('cotizaciones_proveedores')
            .insert({
                id_pedido: idPedido,
                id_proveedor: proveedor.id_proveedor,
                fecha_respuesta: hoy,
                observacion: 'Cotización generada automáticamente al crear el pedido',
                id_estado: idEstado,
                codigo_cotizacion: codigoCotizacion,
            })
            .select()
            .single()
        if (errCot) throw new Error(errCot.message)

        // 3. Crear detalles de cotización a partir de los detalles del pedido
        const detallesCot = detallesPedido.map((d) => ({
            id_cotizacion: cotizacion.id_cotizacion,
            id_producto: d.id_producto,
            cantidad: Number(d.cantidad),
            precio_unitario: 0,  // El proveedor completará este valor
            es_mejor_opcion: false,
            observacion: '',
        }))

        const { data: detallesCreados, error: errDet } = await supabase
            .from('cotizaciones_proveedores_detalle')
            .insert(detallesCot)
            .select()
        if (errDet) throw new Error(errDet.message)

        resultados.push({ cotizacion, detalles: detallesCreados })
    }

    return resultados
}

export default {
    getAllPedidos,
    getPedidos,
    getTablePedidos,
    getPedidoCompleto,
    postPedido,
    postDetallePedido,
    crearCotizacionesParaPedido,
}