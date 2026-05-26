import supabase from '../../config/supabase.js'

const formatMoney = (value) => {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

const normalize = (value) => (value ?? '').toString().trim()

const getEstadoNombre = async (idEstado) => {
  if (idEstado === null || idEstado === undefined) return ''
  const { data, error } = await supabase
    .from('estados')
    .select('nombre')
    .eq('id_estado', idEstado)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return normalize(data?.nombre)
}

const getClienteInfo = async (idCliente) => {
  if (idCliente === null || idCliente === undefined) return { nombre: '', apellido: '', ci: '' }
  
  const { data: cliente, error: errorCliente } = await supabase
    .from('clientes')
    .select('id_persona,ci')
    .eq('id_cliente', idCliente)
    .maybeSingle()
  
  if (errorCliente) throw new Error(errorCliente.message)
  if (!cliente?.id_persona) return { nombre: '', apellido: '', ci: cliente?.ci || '' }

  const { data: persona, error: errorPersona } = await supabase
    .from('personas')
    .select('nombre,apellido')
    .eq('id_persona', cliente.id_persona)
    .maybeSingle()
  
  if (errorPersona) throw new Error(errorPersona.message)
  return {
    nombre: normalize(persona?.nombre ?? ''),
    apellido: normalize(persona?.apellido ?? ''),
    ci: normalize(cliente?.ci ?? '')
  }
}

const getProductoInfo = async (idProducto) => {
  if (idProducto === null || idProducto === undefined) {
    return { nombre: 'Sin producto', categoria: '-', marca: '-' }
  }

  const { data: producto, error: errorProducto } = await supabase
    .from('productos')
    .select('nombre,id_categoria,id_marca')
    .eq('id_producto', idProducto)
    .maybeSingle()

  if (errorProducto) throw new Error(errorProducto.message)
  if (!producto) return { nombre: `ID ${idProducto}`, categoria: '-', marca: '-' }

  const { data: categoria } = producto.id_categoria
    ? await supabase.from('categorias_productos').select('nombre').eq('id_categoria', producto.id_categoria).maybeSingle()
    : { data: null }

  const { data: marca } = producto.id_marca
    ? await supabase.from('marcas').select('nombre').eq('id_marca', producto.id_marca).maybeSingle()
    : { data: null }

  return {
    nombre: normalize(producto.nombre) || `ID ${idProducto}`,
    categoria: normalize(categoria?.nombre) || '-',
    marca: normalize(marca?.nombre) || '-'
  }
}

const getAllPresupuestos = async () => {
  const { data: presupuestos, error } = await supabase
    .from('presupuestos')
    .select('id_presupuesto,id_cliente,fecha,id_estado')
    .order('id_presupuesto', { ascending: false })

  if (error) throw new Error(error.message)

  return Promise.all((presupuestos || []).map(async (presupuesto) => {
    const cliente = await getClienteInfo(presupuesto.id_cliente)
    const estado = await getEstadoNombre(presupuesto.id_estado)
    const fecha = new Date(presupuesto.fecha)
    const validoHasta = new Date(fecha)
    validoHasta.setDate(validoHasta.getDate() + 10)

    return {
      id_presupuesto: presupuesto.id_presupuesto,
      codigo: `PRE - ${String(presupuesto.id_presupuesto).padStart(6, '0')}`,
      cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
      fecha: presupuesto.fecha ?? '',
      valido_hasta: validoHasta.toISOString().split('T')[0],
      estado,
      id_estado: presupuesto.id_estado
    }
  }))
}

const getPresupuesto = async (id) => {
  const presupuestoId = Number(id)
  if (!Number.isInteger(presupuestoId)) throw new Error('ID de presupuesto inválido')

  const { data: presupuesto, error } = await supabase
    .from('presupuestos')
    .select('id_presupuesto,id_cliente,fecha,id_estado')
    .eq('id_presupuesto', presupuestoId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!presupuesto) throw new Error('Presupuesto no encontrado')

  const cliente = await getClienteInfo(presupuesto.id_cliente)
  const estado = await getEstadoNombre(presupuesto.id_estado)
  const fecha = new Date(presupuesto.fecha)
  const validoHasta = new Date(fecha)
  validoHasta.setDate(validoHasta.getDate() + 10)

  return {
    id_presupuesto: presupuesto.id_presupuesto,
    codigo: `PRE - ${String(presupuesto.id_presupuesto).padStart(6, '0')}`,
    cliente,
    fecha: presupuesto.fecha ?? '',
    valido_hasta: validoHasta.toISOString().split('T')[0],
    estado,
    id_estado: presupuesto.id_estado
  }
}

const getDetallePresupuesto = async (id) => {
  const presupuestoId = Number(id)
  if (!Number.isInteger(presupuestoId)) throw new Error('ID de presupuesto inválido')

  const { data: detalles, error } = await supabase
    .from('presupuestos_detalle')
    .select('id_presupuesto_detalle,id_producto,cantidad,precio_unitario')
    .eq('id_presupuesto', presupuestoId)

  if (error) throw new Error(error.message)

  return Promise.all((detalles || []).map(async (detalle) => {
    const producto = await getProductoInfo(detalle.id_producto)
    const subtotal = (detalle.cantidad ?? 0) * (detalle.precio_unitario ?? 0)

    return {
      id_presupuesto_detalle: detalle.id_presupuesto_detalle,
      producto: producto.nombre,
      categoria: producto.categoria,
      marca: producto.marca,
      cantidad: detalle.cantidad ?? 0,
      precio_unitario: formatMoney(detalle.precio_unitario),
      subtotal: formatMoney(subtotal)
    }
  }))
}

const createPresupuesto = async (presupuestoData) => {
  const { id_cliente, fecha_creacion, id_estado } = presupuestoData

  if (!id_cliente) throw new Error('id_cliente es requerido')

  let idEstadoFinal = id_estado
  if (!idEstadoFinal) {
    const { data: estadoData, error: estadoError } = await supabase
      .from('estados')
      .select('id_estado')
      .eq('nombre', 'Pendiente')
      .maybeSingle()
    
    if (estadoError) throw new Error(estadoError.message)
    idEstadoFinal = estadoData?.id_estado || 1
  }

  const { data, error } = await supabase
    .from('presupuestos')
    .insert([
      {
        id_cliente,
        fecha: fecha_creacion,
        id_estado: idEstadoFinal
      }
    ])
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('No se pudo crear el presupuesto')

  return data[0]
}

const createDetallePresupuesto = async (detalles) => {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new Error('detalles debe ser un array no vacío')
  }

  const datosInsertar = detalles.map((detalle) => ({
    id_presupuesto: detalle.id_presupuesto,
    id_producto: detalle.id_producto,
    cantidad: detalle.cantidad,
    precio_unitario: detalle.precio_unitario
  }))

  const { data, error } = await supabase
    .from('presupuestos_detalle')
    .insert(datosInsertar)
    .select()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('No se pudo crear el detalle del presupuesto')

  return data
}

const getAllPresupuestosTabla = async () => {
  const { data: presupuestos, error } = await supabase
    .from('presupuestos')
    .select('id_presupuesto,id_cliente,fecha,id_estado')
    .order('id_presupuesto', { ascending: false })

  if (error) throw new Error(error.message)

  const resultado = await Promise.all((presupuestos || []).map(async (presupuesto) => {
    const cliente = await getClienteInfo(presupuesto.id_cliente)
    const estado = await getEstadoNombre(presupuesto.id_estado)
    const fecha = new Date(presupuesto.fecha)
    const validoHasta = new Date(fecha)
    validoHasta.setDate(validoHasta.getDate() + 10)

    const { data: detalles } = await supabase
      .from('presupuestos_detalle')
      .select('cantidad,precio_unitario')
      .eq('id_presupuesto', presupuesto.id_presupuesto)

    let total = 0
    if (detalles) {
      total = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario), 0)
    }

    return {
      codigo_presupuesto: `PRE - ${String(presupuesto.id_presupuesto).padStart(6, '0')}`,
      cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
      fecha_creacion: presupuesto.fecha ?? '',
      valido_hasta: validoHasta.toISOString().split('T')[0],
      total: formatMoney(total),
      estados: { nombre: estado },
      id_presupuesto: presupuesto.id_presupuesto
    }
  }))

  return resultado
}

export default {
  getAllPresupuestos,
  getPresupuesto,
  getDetallePresupuesto,
  createPresupuesto,
  createDetallePresupuesto,
  getAllPresupuestosTabla
}