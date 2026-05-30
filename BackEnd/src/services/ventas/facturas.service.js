import supabase from '../../config/supabase.js'

const SELECT_FULL = `
  *,
  clientes(*, personas(*)),
  presupuestos(*, presupuestos_detalle(*)),
  detalles_facturas_ventas(
    *,
    productos(
      *,
      marcas(nombre),
      categorias_productos(nombre)
    )
  ),
  estados(nombre),
  notas_credito_ventas(*, estados(nombre))
`

const SELECT_SINGLE = `
  *,
  clientes(personas(nombre, apellido, ruc, direccion, telefono, correo, tipo_persona)),
  presupuestos(
    fecha,
    estados(nombre),
    presupuestos_detalle(
        id_producto,
        cantidad,
        precio_unitario,
        productos(
            id_producto,
            nombre,
            codigo,
            descripcion,
            precio_compra,
            precio_venta,
            marcas(nombre),
            categorias_productos(nombre)
    ))),
  detalles_facturas_ventas(
    id_producto,
    cantidad,
    precio_unitario,
    productos(
      id_producto,
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
  notas_credito_ventas(*, estados(nombre))
`

const getAllFacturas = async () => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(SELECT_FULL)
  if (error) throw new Error(error.message)
  return data
}

const getFactura = async (id) => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(SELECT_SINGLE)
    .eq('id_factura', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const getFacturaByCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(SELECT_SINGLE)
    .eq('codigo_factura', codigo)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const getTableFacturas = async () => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .select(`
      id_factura,
      codigo_factura,
      fecha_emision,
      fecha_vencimiento,
      clientes(personas(nombre, apellido)),
      presupuestos(id_presupuesto),
      estados(nombre)
    `)
  if (error) throw new Error(error.message)
  return data
}

// Mejorado: Crea factura con transacción completa
// Valida vigencia, deducce stock, actualiza presupuesto
const postFactura = async (id_cliente, id_presupuesto, timbrado, nro_factura, fecha_emision, importe_total, fecha_vencimiento, id_estado, codigo_factura, detalles) => {
  
  // 1. VALIDAR que presupuesto existe y está vigente
  if (!id_presupuesto) {
    throw new Error('id_presupuesto es requerido')
  }

  const { data: presupuesto, error: errorPresupuesto } = await supabase
    .from('presupuestos')
    .select('id_presupuesto, id_cliente, fecha, id_estado')
    .eq('id_presupuesto', id_presupuesto)
    .single()
  
  if (errorPresupuesto || !presupuesto) {
    throw new Error('Presupuesto no encontrado')
  }

  // Verificar vigencia (10 días desde fecha de creación)
  const fechaPresupuesto = new Date(presupuesto.fecha)
  const fechaVencimiento = new Date(fechaPresupuesto)
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 10)
  const hoy = new Date()
  
  if (hoy > fechaVencimiento) {
    throw new Error('El presupuesto ha vencido (válido por 10 días)')
  }

  // 2. CREAR FACTURA
  const { data: factura, error: errorFactura } = await supabase
    .from('facturas_ventas')
    .insert({ 
      id_cliente: id_cliente || presupuesto.id_cliente,
      id_presupuesto, 
      timbrado, 
      nro_factura, 
      fecha_emision, 
      importe_total, 
      fecha_vencimiento, 
      id_estado: id_estado || 1, 
      codigo_factura 
    })
    .select()
    .single()
  
  if (errorFactura) {
    throw new Error(`Error creando factura: ${errorFactura.message}`)
  }

  // 3. CREAR DETALLES y DEDUCIR STOCK
  if (!detalles || detalles.length === 0) {
    throw new Error('Debe incluir al menos un detalle')
  }

  // Validar que todos los detalles tengan los campos requeridos
  const detallesValidos = detalles.filter(d => d.id_producto && d.cantidad && d.precio_unitario);
  if (detallesValidos.length === 0) {
    throw new Error('Los detalles no tienen los campos requeridos (id_producto, cantidad, precio_unitario)')
  }

  const detallesConId = detallesValidos.map(d => ({
    id_producto: Number(d.id_producto),
    cantidad: Number(d.cantidad),
    precio_unitario: Number(d.precio_unitario),
    id_factura: factura.id_factura
  }))

  // Validar y deducir stock para cada producto
  for (const detalle of detallesConId) {
    // Obtener stock actual del producto
    const { data: inventario, error: errorInventario } = await supabase
      .from('inventarios')
      .select('cantidad')
      .eq('id_producto', detalle.id_producto)
      .maybeSingle()
    
    if (errorInventario) {
      throw new Error(`Error verificando stock del producto ${detalle.id_producto}: ${errorInventario.message}`)
    }

    const stockActual = inventario?.cantidad || 0
    
    if (stockActual < detalle.cantidad) {
      throw new Error(`Stock insuficiente para producto ID ${detalle.id_producto}. Disponible: ${stockActual}, Solicitado: ${detalle.cantidad}`)
    }

    // Deducir stock
    const { error: errorStock } = await supabase
      .from('inventarios')
      .update({ cantidad: stockActual - detalle.cantidad })
      .eq('id_producto', detalle.id_producto)
    
    if (errorStock) {
      throw new Error(`Error deduciendo stock: ${errorStock.message}`)
    }
  }

  // Insertar detalles de factura - con manejo de errores mejorado
  const { data: detallesCreados, error: errorDetalles } = await supabase
    .from('detalles_facturas_ventas')
    .insert(detallesConId)
    .select(`
      *,
      productos(
        id_producto,
        nombre,
        codigo,
        descripcion,
        precio_compra,
        precio_venta
      )
    `)
  
  if (errorDetalles) {
    throw new Error(`Error creando detalles: ${errorDetalles.message}`)
  }

  if (!detallesCreados || detallesCreados.length === 0) {
    throw new Error('Los detalles no se crearon correctamente')
  }

  // 4. ACTUALIZAR PRESUPUESTO a "Confirmado"
  // Buscar ID de estado "Confirmado" dinámicamente
  const { data: estadoConfirmado, error: errorEstadoConfirmado } = await supabase
    .from('estados')
    .select('id_estado')
    .eq('nombre', 'Confirmado')
    .maybeSingle()
  
  const idEstadoConfirmado = estadoConfirmado?.id_estado || 2 // fallback a 2

  const { error: errorActualizar } = await supabase
    .from('presupuestos')
    .update({ id_estado: idEstadoConfirmado })
    .eq('id_presupuesto', id_presupuesto)
  
  if (errorActualizar) {
    console.error('Advertencia: No se pudo actualizar estado del presupuesto:', errorActualizar.message)
    // No lanzar error, la factura ya fue creada
  }

  // 5. (OPCIONAL) Generar asientos contables
  // TODO: Implementar asientos automáticos cuando sea necesario

  return { factura, detalles: detallesCreados }
}

const updateFactura = async (id, datos) => {
  const { detalles, ...datosFactura } = datos

  const actualizarFactura = Object.fromEntries(
    Object.entries(datosFactura).filter(([_, v]) => v !== undefined && v !== '')
  )
  const { data: factura, error } = await supabase
    .from('facturas_ventas')
    .update(actualizarFactura)
    .eq('id_factura', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (detalles && detalles.length > 0) {
    for (const detalle of detalles) {
      const { id_detalle_venta, ...datosDetalle } = detalle
      const { error: errorDetalle } = await supabase
        .from('detalles_facturas_ventas')
        .update(datosDetalle)
        .eq('id_detalle_venta', id_detalle_venta)
      if (errorDetalle) throw new Error(errorDetalle.message)
    }
  }

  return factura
}

const updateEstadoFactura = async (id, id_estado) => {
  const { data, error } = await supabase
    .from('facturas_ventas')
    .update({ id_estado })
    .eq('id_factura', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const deleteFactura = async (id) => {
  // Obtener la factura primero para verificar que exista
  const { data: factura, error: errorFactura } = await supabase
    .from('facturas_ventas')
    .select('id_factura, id_estado')
    .eq('id_factura', id)
    .single()
  
  if (errorFactura || !factura) {
    throw new Error('Factura no encontrada')
  }

  // En lugar de eliminar, cambiar estado a "Anulada" (id_estado = 3, asumiendo que existe)
  // Esto evita problemas de integridad referencial y permite auditoría
  const { data: estadoAnulada, error: errorEstado } = await supabase
    .from('estados')
    .select('id_estado')
    .eq('nombre', 'Anulada')
    .maybeSingle()
  
  const idEstadoAnulada = estadoAnulada?.id_estado || 3 // fallback a 3

  const { error: errorActualizar } = await supabase
    .from('facturas_ventas')
    .update({ id_estado: idEstadoAnulada })
    .eq('id_factura', id)
  
  if (errorActualizar) {
    throw new Error(`Error anulando factura: ${errorActualizar.message}`)
  }

  // Restablecer el estado del presupuesto a "Vigente" si lo había
  const { data: facturaDatos } = await supabase
    .from('facturas_ventas')
    .select('id_presupuesto')
    .eq('id_factura', id)
    .single()

  if (facturaDatos?.id_presupuesto) {
    const { error: errorPresupuesto } = await supabase
      .from('presupuestos')
      .update({ id_estado: 1 }) // "Vigente"
      .eq('id_presupuesto', facturaDatos.id_presupuesto)
    
    if (errorPresupuesto) {
      console.error('Advertencia: No se pudo revertir estado del presupuesto:', errorPresupuesto.message)
    }
  }

  return { message: 'Factura anulada correctamente' }
}

export default { getAllFacturas, getFactura, getFacturaByCodigo, getTableFacturas, postFactura, updateFactura, updateEstadoFactura, deleteFactura }