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
        .select('id_pedido, codigo_pedido, fecha_creacion, estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}

// Retorna cabecera + detalle de productos del pedido
const getPedidoCompleto = async (id) => {
    // 1. Cabecera del pedido
    const { data: pedido, error: errPedido } = await supabase
        .from('pedidos_compras')
        .select('id_pedido, codigo_pedido, fecha_creacion, precio_total, estados(nombre)')
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
        inventario: d.productos?.inventarios?.cantidad ?? 0,
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
        estado: pedido.estados?.nombre ?? '—',
        detalle: detalleMapeado,
        cotizaciones: cotizacionesMapeadas,
    }
}

const postPedido = async ({ fecha_creacion, precio_total, id_estado, codigo_pedido }) => {
    const { data, error } = await supabase
        .from('pedidos_compras')
        .insert({ fecha_creacion, precio_total, id_estado, codigo_pedido })
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

export default { getAllPedidos, getPedidos, getTablePedidos, getPedidoCompleto, postPedido, postDetallePedido }