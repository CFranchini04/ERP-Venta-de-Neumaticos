import supabase from '../../config/supabase.js'

const getNextCodigo = async () => {
  const { count, error } = await supabase
    .from('notas_credito_compras')
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(error.message)
  return `NC-${String((count ?? 0) + 1).padStart(5, '0')}`
}

const createNotaCredito = async ({
  id_factura_compra, nro_nota_credito, timbrado,
  fecha, monto_total, motivo, detalles
}) => {
  const codigo_nota_credito = await getNextCodigo()

  // 1. Insertar cabecera de nota de crédito (sin estado en la nota misma,
  //    o con el estado que uses — no cambia la factura todavía)
  const { data: nota, error } = await supabase
    .from('notas_credito_compras')
    .insert({
      id_factura_compra, nro_nota_credito, timbrado,
      fecha, monto_total, motivo, codigo_nota_credito,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)

  // 2. Insertar detalles de la nota
  const detallesConId = detalles.map((d) => ({
    id_nota_credito_compra: nota.id_nota_credito_compra,
    id_producto: d.id_producto,
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
    monto_iva: d.monto_iva,
  }))

  const { data: detallesCreados, error: errorDet } = await supabase
    .from('detalles_notas_credito_compras')
    .insert(detallesConId)
    .select()
  if (errorDet) throw new Error(errorDet.message)

  // 3. Verificar si la devolución acumulada (notas anteriores + esta) cubre
  //    la totalidad de cada detalle de la factura
  const { data: detallesFactura } = await supabase
    .from('detalles_facturas_compras')
    .select('id_producto, cantidad')
    .eq('id_factura_compra', id_factura_compra)

  // Sumar todo lo devuelto en TODAS las notas de esta factura (incluida la nueva)
  const { data: todasLasNotas } = await supabase
    .from('notas_credito_compras')
    .select(`detalles_notas_credito_compras(id_producto, cantidad)`)
    .eq('id_factura_compra', id_factura_compra)

  const devueltoPorProducto = {}
  for (const n of todasLasNotas ?? []) {
    for (const d of n.detalles_notas_credito_compras ?? []) {
      devueltoPorProducto[d.id_producto] =
        (devueltoPorProducto[d.id_producto] ?? 0) + Number(d.cantidad)
    }
  }

  const esAnulacionTotal = (detallesFactura ?? []).every(
    (df) => (devueltoPorProducto[df.id_producto] ?? 0) >= Number(df.cantidad)
  )

  // 4. Solo marcar la factura como "anulado" si la devolución es total
  if (esAnulacionTotal) {
    const { data: estadoAnulado } = await supabase
      .from('estados')
      .select('id_estado')
      .ilike('nombre', 'anulado')
      .maybeSingle()

    if (estadoAnulado) {
      await supabase
        .from('facturas_compras')
        .update({ id_estado: estadoAnulado.id_estado })
        .eq('id_factura_compra', id_factura_compra)
    }
  }

  // 5. Revertir stock en inventario
  for (const d of detalles) {
    const { data: inv } = await supabase
      .from('inventarios')
      .select('id_inventario, cantidad')
      .eq('id_producto', d.id_producto)
      .order('id_inventario', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (inv) {
      await supabase
        .from('inventarios')
        .update({ cantidad: Math.max(0, Number(inv.cantidad) - Number(d.cantidad)) })
        .eq('id_inventario', inv.id_inventario)
    }
  }

 // 6. Revertir cantidad_recibida Y marcar esos detalles de orden como anulados
for (const d of detalles) {
  if (!d.id_orden_compra_detalle) continue

  // Revertir cantidad_recibida
  const { data: detOrden } = await supabase
    .from('ordenes_compras_detalle')
    .select('cantidad_recibida')
    .eq('id_orden_compra_detalle', d.id_orden_compra_detalle)
    .single()

  if (detOrden) {
    await supabase
      .from('ordenes_compras_detalle')
      .update({ cantidad_recibida: Math.max(0, Number(detOrden.cantidad_recibida) - Number(d.cantidad)) })
      .eq('id_orden_compra_detalle', d.id_orden_compra_detalle)
  }

  // Marcar el detalle de orden como anulado permanentemente
  const { data: estadoAnulado } = await supabase
    .from('estados')
    .select('id_estado')
    .ilike('nombre', 'anulado')
    .maybeSingle()

  if (estadoAnulado) {
    await supabase
      .from('ordenes_compras_detalle')
      .update({ id_estado: estadoAnulado.id_estado })
      .eq('id_orden_compra_detalle', d.id_orden_compra_detalle)
  }
}

// 6.5 — Recalcular placeholder excluyendo detalles anulados
const { data: factDataPlaceholder } = await supabase
  .from('facturas_compras')
  .select('id_orden_compra, id_proveedor')
  .eq('id_factura_compra', id_factura_compra)
  .single()

if (factDataPlaceholder?.id_orden_compra) {
  const idOrden = factDataPlaceholder.id_orden_compra
  const idProveedor = factDataPlaceholder.id_proveedor

  // Solo detalles NO anulados y con pendiente real
  const { data: detallesOrden } = await supabase
    .from('ordenes_compras_detalle')
    .select('id_orden_compra_detalle, id_producto, cantidad_solicitada, cantidad_recibida, estados(nombre)')
    .eq('id_orden', idOrden)

  const pendientes = (detallesOrden || []).filter((d) => {
    const esAnulado = (d.estados?.nombre || '').toLowerCase() === 'anulado'
    return !esAnulado && Number(d.cantidad_recibida) < Number(d.cantidad_solicitada)
  })

  // Buscar placeholder existente
  const { data: placeholderRows } = await supabase
    .from('facturas_compras')
    .select('id_factura_compra')
    .eq('id_orden_compra', idOrden)
    .or('nro_factura.is.null,nro_factura.eq.')

  const placeholder = placeholderRows?.[0] ?? null

  if (pendientes.length > 0) {
    if (placeholder) {
      await supabase
        .from('detalles_facturas_compras')
        .delete()
        .eq('id_factura_compra', placeholder.id_factura_compra)

      await supabase
        .from('detalles_facturas_compras')
        .insert(pendientes.map((d) => ({
          id_factura_compra: placeholder.id_factura_compra,
          id_producto: d.id_producto,
          cantidad: Number(d.cantidad_solicitada) - Number(d.cantidad_recibida),
          precio_unitario: 0,
          porcentaje_iva: 10,
          monto_iva: 0,
          id_orden_compra_detalle: d.id_orden_compra_detalle,
        })))
    } else {
      const { data: estadoRow } = await supabase
        .from('estados')
        .select('id_estado')
        .ilike('nombre', 'pendiente')
        .maybeSingle()

      const codigo_factura = `FC-${idOrden}-${idProveedor}-${Date.now()}`
      const { data: nuevaFactura } = await supabase
        .from('facturas_compras')
        .insert({ id_proveedor: idProveedor, id_orden_compra: idOrden, id_estado: estadoRow?.id_estado ?? null, codigo_factura })
        .select()
        .single()

      await supabase
        .from('detalles_facturas_compras')
        .insert(pendientes.map((d) => ({
          id_factura_compra: nuevaFactura.id_factura_compra,
          id_producto: d.id_producto,
          cantidad: Number(d.cantidad_solicitada) - Number(d.cantidad_recibida),
          precio_unitario: 0,
          porcentaje_iva: 10,
          monto_iva: 0,
          id_orden_compra_detalle: d.id_orden_compra_detalle,
        })))
    }
  } else if (placeholder) {
    // No quedan pendientes — eliminar el placeholder vacío
    await supabase
      .from('detalles_facturas_compras')
      .delete()
      .eq('id_factura_compra', placeholder.id_factura_compra)
    await supabase
      .from('facturas_compras')
      .delete()
      .eq('id_factura_compra', placeholder.id_factura_compra)
  }

  // Revertir orden de "completado" a "pendiente" si corresponde
  const { data: estadoOrden } = await supabase
    .from('ordenes_compras')
    .select('estados(nombre)')
    .eq('id_orden', idOrden)
    .single()

  if ((estadoOrden?.estados?.nombre || '').toLowerCase() === 'completado') {
    const { data: estadoPendiente } = await supabase
      .from('estados')
      .select('id_estado')
      .ilike('nombre', 'pendiente')
      .maybeSingle()

    if (estadoPendiente) {
      await supabase
        .from('ordenes_compras')
        .update({ id_estado: estadoPendiente.id_estado })
        .eq('id_orden', idOrden)
    }
  }
}
// 7. Anular la orden solo si TODAS las facturas confirmadas están anuladas
const { data: facturaData } = await supabase
  .from('facturas_compras')
  .select('id_orden_compra')
  .eq('id_factura_compra', id_factura_compra)
  .single()

if (facturaData?.id_orden_compra) {
  // Traer todas las facturas reales de la orden (excluir placeholders sin nro_factura)
  const { data: todasFacturas } = await supabase
    .from('facturas_compras')
    .select('id_factura_compra, nro_factura, estados(nombre)')
    .eq('id_orden_compra', facturaData.id_orden_compra)

  const facturasReales = (todasFacturas || []).filter(
    (f) => f.nro_factura && f.nro_factura.toString().trim() !== ''
  )

  const todasAnuladas =
    facturasReales.length > 0 &&
    facturasReales.every(
      (f) => (f.estados?.nombre || '').toLowerCase() === 'anulado'
    )

  if (todasAnuladas) {
    const { data: estadoAnuladoOrden } = await supabase
      .from('estados')
      .select('id_estado')
      .ilike('nombre', 'anulado')
      .maybeSingle()

    if (estadoAnuladoOrden) {
      await supabase
        .from('ordenes_compras')
        .update({ id_estado: estadoAnuladoOrden.id_estado })
        .eq('id_orden', facturaData.id_orden_compra)
    }
  }
}
  return { nota, detalles: detallesCreados, esAnulacionTotal }
}

const getNotasByFactura = async (id_factura_compra) => {
  const { data, error } = await supabase
    .from('notas_credito_compras')
    .select(`
      *, estados(nombre),
      detalles_notas_credito_compras(
        *, productos(nombre)
      )
    `)
    .eq('id_factura_compra', id_factura_compra)
  if (error) throw new Error(error.message)
  return data
}

export default { getNextCodigo, createNotaCredito, getNotasByFactura }