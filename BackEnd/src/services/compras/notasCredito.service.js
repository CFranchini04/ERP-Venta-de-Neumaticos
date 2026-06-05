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

  // 1. Insertar cabecera de nota de crédito
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

  const { data: detallesFactura } = await supabase
    .from('detalles_facturas_compras')
    .select('id_producto, cantidad, precio_unitario')
    .eq('id_factura_compra', id_factura_compra)

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

  const detallesReales = (detallesFactura ?? []).filter(
    (df) => Number(df.precio_unitario) > 0
  )

  const esAnulacionTotal = detallesReales.length > 0 && detallesReales.every(
    (df) => (devueltoPorProducto[df.id_producto] ?? 0) >= Number(df.cantidad)
  )

  // ✅ FIX: Obtener id_orden_compra e id_proveedor ANTES del paso 4 para usarlos después
  const { data: factDataBase } = await supabase
    .from('facturas_compras')
    .select('id_orden_compra, id_proveedor')
    .eq('id_factura_compra', id_factura_compra)
    .single()

  const idOrdenCompra = factDataBase?.id_orden_compra
  const idProveedor = factDataBase?.id_proveedor

  // 4. Marcar la factura como "anulado" si la devolución es total
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

    // ✅ NUEVO: eliminar la orden de pago asociada a esta factura específica
    const { data: detalleOP } = await supabase
      .from('detalles_orden_pago')
      .select('id_d_orden_pago, id_orden_pago')
      .eq('id_factura_compra', id_factura_compra)
      .maybeSingle()

    if (detalleOP?.id_orden_pago) {
      // Ver cuántos detalles tiene esa orden de pago
      const { data: todosDetallesOP } = await supabase
        .from('detalles_orden_pago')
        .select('id_d_orden_pago')
        .eq('id_orden_pago', detalleOP.id_orden_pago)

      if ((todosDetallesOP || []).length <= 1) {
        // Solo tiene esta factura — eliminar la orden de pago completa
        await supabase
          .from('detalles_orden_pago')
          .delete()
          .eq('id_orden_pago', detalleOP.id_orden_pago)

        await supabase
          .from('ordenes_pago')
          .delete()
          .eq('id_orden_pago', detalleOP.id_orden_pago)
      } else {
        // Tiene otras facturas — solo eliminar este detalle
        await supabase
          .from('detalles_orden_pago')
          .delete()
          .eq('id_d_orden_pago', detalleOP.id_d_orden_pago)
      }
    }
      // ✅ FIX: Anular también el placeholder de la misma orden para que no
      //         aparezca como factura activa en órdenes de pago ni en el listado.
      //         Usamos DOS condiciones separadas porque .or() con eq vacío
      //         no es confiable en todos los drivers de Supabase.
      if (idOrdenCompra) {
        // Buscar placeholders: facturas sin nro_factura (null o string vacío)
        const { data: placeholdersNull } = await supabase
          .from('facturas_compras')
          .select('id_factura_compra')
          .eq('id_orden_compra', idOrdenCompra)
          .is('nro_factura', null)

        const { data: placeholdersVacio } = await supabase
          .from('facturas_compras')
          .select('id_factura_compra')
          .eq('id_orden_compra', idOrdenCompra)
          .eq('nro_factura', '')

        const placeholders = [
          ...(placeholdersNull ?? []),
          ...(placeholdersVacio ?? []),
        ]

        // ✅ FIX: Anular cada placeholder encontrado
        for (const ph of placeholders) {
          await supabase
            .from('facturas_compras')
            .update({ id_estado: estadoAnulado.id_estado })
            .eq('id_factura_compra', ph.id_factura_compra)

          // Limpiar detalles del placeholder para que no genere ruido
          await supabase
            .from('detalles_facturas_compras')
            .delete()
            .eq('id_factura_compra', ph.id_factura_compra)
        }
      }
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

  // 6. Revertir cantidad_recibida Y marcar detalles de orden como anulados
  for (const d of detalles) {
    if (!d.id_orden_compra_detalle) continue

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
  //       Solo si NO fue anulación total (en anulación total ya limpiamos los placeholders arriba)
  if (!esAnulacionTotal && idOrdenCompra) {
    const { data: detallesOrden } = await supabase
      .from('ordenes_compras_detalle')
      .select('id_orden_compra_detalle, id_producto, cantidad_solicitada, cantidad_recibida, estados(nombre)')
      .eq('id_orden', idOrdenCompra)

    const pendientes = (detallesOrden || []).filter((d) => {
      const esAnulado = (d.estados?.nombre || '').toLowerCase() === 'anulado'
      return !esAnulado && Number(d.cantidad_recibida) < Number(d.cantidad_solicitada)
    })

    // ✅ FIX: Buscar placeholders en dos queries separadas (evita el bug de .or() con eq vacío)
    const { data: placeholdersNull } = await supabase
      .from('facturas_compras')
      .select('id_factura_compra')
      .eq('id_orden_compra', idOrdenCompra)
      .is('nro_factura', null)

    const { data: placeholdersVacio } = await supabase
      .from('facturas_compras')
      .select('id_factura_compra')
      .eq('id_orden_compra', idOrdenCompra)
      .eq('nro_factura', '')

    const placeholders = [
      ...(placeholdersNull ?? []),
      ...(placeholdersVacio ?? []),
    ]

    // Usar solo el primero; si hay más de uno es inconsistencia de datos
    const placeholder = placeholders[0] ?? null

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

        const codigo_factura = `FC-${idOrdenCompra}-${idProveedor}-${Date.now()}`
        const { data: nuevaFactura } = await supabase
          .from('facturas_compras')
          .insert({ id_proveedor: idProveedor, id_orden_compra: idOrdenCompra, id_estado: estadoRow?.id_estado ?? null, codigo_factura })
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
      .eq('id_orden', idOrdenCompra)
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
          .eq('id_orden', idOrdenCompra)
      }
    }
  }

  const idOrdenFinal = idOrdenCompra ?? factDataBase?.id_orden_compra

  if (idOrdenFinal) {
    // Leer el estado ACTUALIZADO de todas las facturas (post-update del paso 4)
    const { data: todasFacturas } = await supabase
      .from('facturas_compras')
      .select('id_factura_compra, nro_factura, id_estado, estados(nombre)')
      .eq('id_orden_compra', idOrdenFinal)

    const facturasReales = (todasFacturas || []).filter(
      (f) => f.nro_factura && f.nro_factura.toString().trim() !== ''
    )

    const todasAnuladas =
      facturasReales.length > 0 &&
      facturasReales.every(
        (f) => (f.estados?.nombre || '').toLowerCase() === 'anulado'
      )

    if (todasAnuladas) {
      // Obtener id_estado anulado (ya lo tenemos del paso 4 si esAnulacionTotal,
      // pero lo buscamos de nuevo para no depender del scope anterior)
      const { data: estadoAnuladoRow } = await supabase
        .from('estados')
        .select('id_estado')
        .ilike('nombre', 'anulado')
        .maybeSingle()

      const idEstadoAnulado = estadoAnuladoRow?.id_estado
      if (!idEstadoAnulado) return { nota, detalles: detallesCreados, esAnulacionTotal }

      // Anular la orden de compra
      await supabase
        .from('ordenes_compras')
        .update({ id_estado: idEstadoAnulado })
        .eq('id_orden', idOrdenFinal)

      // Anular todos los placeholders restantes de esta orden
      const { data: phNull } = await supabase
        .from('facturas_compras')
        .select('id_factura_compra')
        .eq('id_orden_compra', idOrdenFinal)
        .is('nro_factura', null)

      const { data: phVacio } = await supabase
        .from('facturas_compras')
        .select('id_factura_compra')
        .eq('id_orden_compra', idOrdenFinal)
        .eq('nro_factura', '')

      const placeholders = [...(phNull ?? []), ...(phVacio ?? [])]
      for (const ph of placeholders) {
        await supabase
          .from('facturas_compras')
          .update({ id_estado: idEstadoAnulado })
          .eq('id_factura_compra', ph.id_factura_compra)

        await supabase
          .from('detalles_facturas_compras')
          .delete()
          .eq('id_factura_compra', ph.id_factura_compra)
      }

      // Anular las órdenes de pago vinculadas a las facturas reales de esta orden
      const idsFacturasReales = facturasReales.map((f) => f.id_factura_compra)

      const { data: detallesPago } = await supabase
        .from('detalles_orden_pago')
        .select('id_d_orden_pago, id_orden_pago')
        .in('id_factura_compra', idsFacturasReales)

      if (detallesPago && detallesPago.length > 0) {
        const idsOrdenesPago = [...new Set(detallesPago.map((d) => d.id_orden_pago))]

        for (const idOP of idsOrdenesPago) {
          // Ver cuántos detalles tiene esta orden de pago en total
          const { data: todosDetallesOP } = await supabase
            .from('detalles_orden_pago')
            .select('id_d_orden_pago')
            .eq('id_orden_pago', idOP)

          if ((todosDetallesOP || []).length <= 1) {
            // ✅ Solo tiene esta factura — eliminar la orden de pago completa
            await supabase
              .from('detalles_orden_pago')
              .delete()
              .eq('id_orden_pago', idOP)

            await supabase
              .from('ordenes_pago')
              .delete()
              .eq('id_orden_pago', idOP)
          } else {
            // ✅ Tiene otras facturas — solo anular, no eliminar
            await supabase
              .from('ordenes_pago')
              .update({ id_estado: idEstadoAnulado })
              .eq('id_orden_pago', idOP)
          }
        }
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

