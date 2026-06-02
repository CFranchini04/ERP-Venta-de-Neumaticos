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
    return data || []
}

// Retorna cabecera + detalle de productos + cotizaciones del pedido
const getPedidoCompleto = async (id) => {
    const { data: pedido, error: errPedido } = await supabase
        .from('pedidos_compras')
        .select('id_pedido, codigo_pedido, fecha_creacion, precio_total, estados(nombre)')
        .eq('id_pedido', id)
        .single()
    if (errPedido) throw new Error(errPedido.message)
    if (!pedido) throw new Error('Pedido no encontrado')

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
                inventarios(cantidad, stock_minimo, stock_maximo),
                marcas(nombre),
                categorias_productos(nombre)
            )
        `)
        .eq('id_pedido_compra', id)
    if (errDetalle) throw new Error(errDetalle.message)

    const { data: cotizaciones, error: errCot } = await supabase
        .from('cotizaciones')
        .select(`
            id_cotizacion,
            id_pedido,
            estados(nombre),
            cotizaciones_proveedores_detalle(
                id_cotizacion_detalle,
                id_proveedor,
                cantidad,
                precio_unitario,
                subtotal,
                es_mejor_opcion,
                observacion,
                fecha_respuesta,
                productos(
                    id_producto,
                    nombre
                ),
                proveedores(
                    id_proveedor,
                    personas(nombre, apellido)
                )
            )
        `)
        .eq('id_pedido', id)
    if (errCot) throw new Error(errCot.message)

    const detalleMapeado = (detalle || []).map((d) => ({
        id: d.id_pedido_compra_detalle,
        id_producto: d.productos?.id_producto ?? null,
        producto: d.productos?.nombre ?? '—',
        categoria: d.productos?.categorias_productos?.nombre ?? '—',
        marca: d.productos?.marcas?.nombre ?? '—',
        inventario: d.productos?.inventarios?.[0]?.cantidad ?? 0,
        cantidad: Number(d.cantidad ?? 0),
        precio: Number(d.precio ?? 0),
        subtotal: Number(d.cantidad ?? 0) * Number(d.precio ?? 0),
        estado: d.estados?.nombre ?? '—',
    }))

    const cotizacionesMapeadas = (cotizaciones || []).map((c) => {
        const primeraLinea = c.cotizaciones_proveedores_detalle?.[0]
        const personas = primeraLinea?.proveedores?.personas

        return {
            id_cotizacion: c.id_cotizacion,
            estado: c.estados?.nombre ?? '—',
            id_proveedor: primeraLinea?.id_proveedor ?? null,
            proveedor: personas
                ? `${personas.nombre ?? ''} ${personas.apellido ?? ''}`.trim() || '—'
                : '—',
            detalle: (c.cotizaciones_proveedores_detalle || []).map((cd) => {
                const personas = cd.proveedores?.personas
                const provNombre = personas ? `${personas.nombre ?? ''} ${personas.apellido ?? ''}`.trim() || '—' : '—'
                return {
                    id_cotizacion_detalle: cd.id_cotizacion_detalle,
                    id_producto: cd.productos?.id_producto ?? null,
                    producto: cd.productos?.nombre ?? '—',
                    id_proveedor: cd.id_proveedor,
                    proveedor: provNombre,
                    cantidad: Number(cd.cantidad ?? 0),
                    precio_unitario: Number(cd.precio_unitario ?? 0),
                    subtotal: Number(cd.subtotal ?? 0),
                    es_mejor_opcion: cd.es_mejor_opcion ?? false,
                    observacion: cd.observacion ?? '',
                }
            }),
        }
    })

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

// Crea UNA sola cabecera de cotizacion vinculada al pedido.
// Los detalles (cotizaciones_proveedores_detalle) se agregan luego via CargarCotizacionModal.
const crearCotizacionParaPedido = async (idPedido) => {
    const { data: estadoData } = await supabase
        .from('estados')
        .select('id_estado')
        .eq('nombre', 'En Espera')
        .maybeSingle()
    const idEstado = estadoData?.id_estado ?? 1

    const { data, error } = await supabase
        .from('cotizaciones')
        .insert({ id_pedido: idPedido, id_estado: idEstado })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export default {
    getAllPedidos,
    getPedidos,
    getTablePedidos,
    getPedidoCompleto,
    postPedido,
    postDetallePedido,
    crearCotizacionParaPedido,
}
