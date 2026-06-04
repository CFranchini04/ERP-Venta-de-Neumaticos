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
    id_detalle_compra,
    cantidad,
    precio_unitario,
    porcentaje_iva,
    monto_iva,
    subtotal,
    id_orden_compra_detalle,
    id_producto,
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

const getNextCodigoFactura = async () => {
    const { count, error } = await supabase
        .from('facturas_compras')
        .select('*', { count: 'exact', head: true })
    if (error) throw new Error(error.message)
    const siguiente = (count ?? 0) + 1
    return `FAC-${String(siguiente).padStart(5, '0')}`
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

const confirmarFacturaPlaceholder = async (id, {
  id_proveedor, timbrado, nro_factura, fecha_emision,
  fecha_vencimiento, importe_total, id_orden_compra, detalles
}) => {
  // 1. Buscar id_estado "confirmado"
  const { data: estadoConf } = await supabase
    .from('estados')
    .select('id_estado')
    .ilike('nombre', 'confirmado')
    .maybeSingle()
  const id_estado = estadoConf?.id_estado ?? null

  // 2. Actualizar cabecera con datos reales y estado confirmado
  const { data: factura, error } = await supabase
    .from('facturas_compras')
    .update({ id_proveedor, timbrado, nro_factura, fecha_emision, fecha_vencimiento, importe_total, id_estado })
    .eq('id_factura_compra', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  // 3. Traer los detalles placeholder existentes de esta factura
  //    (precio_unitario = 0 significa que son placeholder)
  const { data: detallesExistentes, error: errorExistentes } = await supabase
    .from('detalles_facturas_compras')
    .select('id_detalle_compra, id_orden_compra_detalle, id_producto, precio_unitario, subtotal')
    .eq('id_factura_compra', id)
  if (errorExistentes) throw new Error(errorExistentes.message)

  // Indexar placeholders por id_orden_compra_detalle para búsqueda rápida
  // Solo consideramos placeholder si precio_unitario = 0 y subtotal = 0 (o null)
  const placeholderPorDetOrden = {}
  for (const ex of detallesExistentes ?? []) {
    const esPlaceholder =
      Number(ex.precio_unitario) === 0 &&
      (Number(ex.subtotal) === 0 || ex.subtotal == null)
    if (esPlaceholder && ex.id_orden_compra_detalle) {
      placeholderPorDetOrden[ex.id_orden_compra_detalle] = ex.id_detalle_compra
    }
  }

  // 4. Separar detalles a actualizar (tienen placeholder) vs a insertar (no tienen)
  const aActualizar = []
  const aInsertar = []

  for (const d of detalles) {
    const idDetOrden = d.id_orden_compra_detalle
    const idPlaceholder = idDetOrden ? placeholderPorDetOrden[idDetOrden] : null

    if (idPlaceholder) {
      aActualizar.push({ ...d, id_detalle_compra: idPlaceholder })
    } else {
      aInsertar.push(d)
    }
  }

  const detallesCreados = []

  // 5a. Actualizar placeholders existentes
  for (const d of aActualizar) {
    const { id_detalle_compra, ...datosDetalle } = d
    const { data: updated, error: errUpd } = await supabase
      .from('detalles_facturas_compras')
      .update({
        cantidad: datosDetalle.cantidad,
        precio_unitario: datosDetalle.precio_unitario,
        porcentaje_iva: datosDetalle.porcentaje_iva,
        monto_iva: datosDetalle.monto_iva,
        id_producto: datosDetalle.id_producto,
      })
      .eq('id_detalle_compra', id_detalle_compra)
      .select()
      .single()
    if (errUpd) throw new Error(errUpd.message)
    detallesCreados.push(updated)
  }

  // 5b. Insertar los que no tenían placeholder
  if (aInsertar.length > 0) {
    const rows = aInsertar.map((d) => ({
      id_factura_compra: id,
      id_producto: d.id_producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      porcentaje_iva: d.porcentaje_iva,
      monto_iva: d.monto_iva,
      id_orden_compra_detalle: d.id_orden_compra_detalle,
    }))
    const { data: insertados, error: errIns } = await supabase
      .from('detalles_facturas_compras')
      .insert(rows)
      .select()
    if (errIns) throw new Error(errIns.message)
    detallesCreados.push(...(insertados ?? []))
  }

  // 6. Sumar cantidad_recibida en cada detalle de orden
  for (const d of detalles) {
    if (!d.id_orden_compra_detalle) continue
    const { data: detOrden } = await supabase
      .from('ordenes_compras_detalle')
      .select('cantidad_recibida')
      .eq('id_orden_compra_detalle', d.id_orden_compra_detalle)
      .single()

    await supabase
      .from('ordenes_compras_detalle')
      .update({ cantidad_recibida: (detOrden?.cantidad_recibida || 0) + d.cantidad })
      .eq('id_orden_compra_detalle', d.id_orden_compra_detalle)
  }

  // 7. Verificar si quedan pendientes en la orden
  const { data: todosDetalles } = await supabase
    .from('ordenes_compras_detalle')
    .select('cantidad_solicitada, cantidad_recibida, id_producto, id_orden_compra_detalle')
    .eq('id_orden', id_orden_compra)

  const todosEntregados = todosDetalles?.every(
    (d) => Number(d.cantidad_recibida) >= Number(d.cantidad_solicitada)
  )

  if (todosEntregados) {
    // Marcar la orden como completada
    const { data: estadoCompleto } = await supabase
      .from('estados')
      .select('id_estado')
      .ilike('nombre', 'completado')
      .maybeSingle()

    if (estadoCompleto) {
      await supabase
        .from('ordenes_compras')
        .update({ id_estado: estadoCompleto.id_estado })
        .eq('id_orden', id_orden_compra)
    }
  } else {
    // Crear nuevo placeholder solo con los productos que siguen pendientes
    const pendientes = (todosDetalles || [])
      .filter((d) => Number(d.cantidad_recibida) < Number(d.cantidad_solicitada))
      .map((d) => ({
        id_orden_compra_detalle: d.id_orden_compra_detalle,
        id_producto: d.id_producto,
        cantidad_solicitada: Number(d.cantidad_solicitada) - Number(d.cantidad_recibida),
      }))

    const { data: estadoRow } = await supabase
      .from('estados')
      .select('id_estado')
      .ilike('nombre', 'pendiente')
      .maybeSingle()

    const codigo_factura = `FC-${id_orden_compra}-${id_proveedor}-${Date.now()}`

    const { data: nuevaFactura, error: errorNueva } = await supabase
      .from('facturas_compras')
      .insert({
        id_proveedor,
        id_orden_compra,
        id_estado: estadoRow?.id_estado ?? null,
        codigo_factura,
      })
      .select()
      .single()
    if (errorNueva) throw new Error(`Error creando nueva factura placeholder: ${errorNueva.message}`)

    const detallesNuevos = pendientes.map((p) => ({
      id_factura_compra: nuevaFactura.id_factura_compra,
      id_producto: p.id_producto,
      cantidad: p.cantidad_solicitada,
      precio_unitario: 0,
      porcentaje_iva: 10,
      monto_iva: 0,
      id_orden_compra_detalle: p.id_orden_compra_detalle,
    }))

    const { error: errorDetNuevo } = await supabase
      .from('detalles_facturas_compras')
      .insert(detallesNuevos)
    if (errorDetNuevo) throw new Error(`Error creando detalles del nuevo placeholder: ${errorDetNuevo.message}`)
  }

    const { data: estadoEspera } = await supabase
      .from('estados')
      .select('id_estado')
      .ilike('nombre', 'pendiente')
      .maybeSingle()

    const codigoOrdenPago = `OP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    const { data: ordenPago, error: errorOrdenPago } = await supabase
      .from('ordenes_pago')
      .insert({
        fecha_creacion: new Date().toISOString().split('T')[0],
        monto_total:    importe_total,
        id_proveedor:   id_proveedor,
        codigo_orden_pago: codigoOrdenPago,
        id_estado:      estadoEspera?.id_estado ?? null,
      })
      .select()
      .single()

    if (errorOrdenPago) throw new Error(`Error creando orden de pago: ${errorOrdenPago.message}`)

    const { error: errorDetallePago } = await supabase
      .from('detalles_orden_pago')
      .insert({
        id_factura_compra: id,              // id_factura_compra confirmada
        id_metodo_pago:   null,            // se asignará al momento de pagar
        monto:            importe_total,
        id_orden_pago:    ordenPago.id_orden_pago,
      })

    if (errorDetallePago) throw new Error(`Error creando detalle de orden de pago: ${errorDetallePago.message}`)


  return { factura, detalles: detallesCreados, todosEntregados, ordenPago }

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
const getFacturasPendientesPago = async () => {
    const { data, error } = await supabase
        .from('facturas_compras')
        .select(`
            id_factura_compra,
            codigo_factura,
            fecha_emision,
            fecha_vencimiento,
            proveedores(personas(nombre, apellido)),
            estados(nombre)
        `)
        .eq('id_estado', 2)
    if (error) throw new Error(error.message)
    return data || []
}
export default { getAllFacturas, getFactura, getFacturaByCodigo, getTableFacturas, getNextCodigoFactura, postFactura, updateFactura, updateEstadoFactura, deleteFactura, confirmarFacturaPlaceholder,getFacturasPendientesPago }