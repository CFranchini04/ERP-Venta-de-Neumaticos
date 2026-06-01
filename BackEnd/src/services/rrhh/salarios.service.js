import supabase from '../../config/supabase.js'

const SELECT_FULL_PAGO = `
  *,
  empleados(*, personas(*)),
  procesos_de_pago(*, estados(nombre)),
  estados(nombre),
  pago_conceptos_detalle(*, novedades(*))
`

const SELECT_SINGLE_PAGO = `
  *,
  empleados(
    *,
    personas(nombre, apellido, ruc, direccion, telefono, correo),
    personas_horario_cargo(
      salario,
      cargo(nombre),
      horarios(*),
      estados(nombre)
    )
  ),
  procesos_de_pago(*, estados(nombre)),
  estados(nombre),
  pago_conceptos_detalle(*, novedades(*))
`

// ─── PROCESOS DE PAGO ───────────────────────────────────────────

const getAllProcesos = async () => {
    const { data, error } = await supabase
        .from('procesos_de_pago')
        .select('*, estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}

const getProceso = async (id) => {
    const { data, error } = await supabase
        .from('procesos_de_pago')
        .select('*, estados(nombre)')
        .eq('id_pdp', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const postProceso = async (mes_año, tipo_proceso, fecha_alta, id_estado) => {
    const { data, error } = await supabase
        .from('procesos_de_pago')
        .insert({ mes_año, tipo_proceso, fecha_alta, id_estado })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const updateEstadoProceso = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('procesos_de_pago')
        .update({ id_estado })
        .eq('id_pdp', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

// ─── PAGOS EMPLEADOS ────────────────────────────────────────────

const getAllPagos = async () => {
    const { data, error } = await supabase
        .from('pagos_empleados')
        .select(SELECT_FULL_PAGO)
    if (error) throw new Error(error.message)
    return data
}

const getPago = async (id) => {
    const { data, error } = await supabase
        .from('pagos_empleados')
        .select(SELECT_SINGLE_PAGO)
        .eq('id_pago', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getPagosByEmpleado = async (id_empleado) => {
    const { data, error } = await supabase
        .from('pagos_empleados')
        .select(SELECT_FULL_PAGO)
        .eq('id_empleado', id_empleado)
    if (error) throw new Error(error.message)
    return data
}

const getPagosByProceso = async (id_pdp) => {
    const { data, error } = await supabase
        .from('pagos_empleados')
        .select(SELECT_FULL_PAGO)
        .eq('id_pdp', id_pdp)
    if (error) throw new Error(error.message)
    return data
}

const getTablePagos = async () => {
    const { data, error } = await supabase
        .from('pagos_empleados')
        .select(`
      id_pago,
      fecha_pago,
      total_ingresos,
      total_deducciones,
      neto_pagado,
      empleados(personas(nombre, apellido)),
      procesos_de_pago(mes_año, tipo_proceso),
      estados(nombre)
    `)
    if (error) throw new Error(error.message)
    return data
}

const postPago = async (id_pdp, id_empleado, total_ingresos, total_deducciones, neto_pagado, fecha_pago, id_estado, detalles) => {
    // 1. Crear el pago
    const { data: pago, error } = await supabase
        .from('pagos_empleados')
        .insert({ id_pdp, id_empleado, total_ingresos, total_deducciones, neto_pagado, fecha_pago, id_estado })
        .select()
        .single()
    if (error) throw new Error(error.message)

    // 2. Crear los conceptos detalle
    const detallesConId = detalles.map(d => ({
        id_novedad: d.id_novedad,
        monto: d.monto,
        observacion: d.observacion,
        id_pago: pago.id_pago
    }))

    const { data: detallesCreados, error: errorDetalles } = await supabase
        .from('pago_conceptos_detalle')
        .insert(detallesConId)
        .select()
    if (errorDetalles) throw new Error(errorDetalles.message)

    return { pago, detalles: detallesCreados }
}

const updatePago = async (id, datos) => {
    const { detalles, ...datosPago } = datos

    const actualizarPago = Object.fromEntries(
        Object.entries(datosPago).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: pago, error } = await supabase
        .from('pagos_empleados')
        .update(actualizarPago)
        .eq('id_pago', id)
        .select()
        .single()
    if (error) throw new Error(error.message)

    if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
            const { id_detalle, ...datosDetalle } = detalle
            const { error: errorDetalle } = await supabase
                .from('pago_conceptos_detalle')
                .update(datosDetalle)
                .eq('id_detalle', id_detalle)
            if (errorDetalle) throw new Error(errorDetalle.message)
        }
    }

    return pago
}

const updateEstadoPago = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('pagos_empleados')
        .update({ id_estado })
        .eq('id_pago', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const deletePago = async (id) => {
    const { error: errorDetalles } = await supabase
        .from('pago_conceptos_detalle')
        .delete()
        .eq('id_pago', id)
    if (errorDetalles) throw new Error(errorDetalles.message)

    const { error } = await supabase
        .from('pagos_empleados')
        .delete()
        .eq('id_pago', id)
    if (error) throw new Error(error.message)

    return { message: 'Pago eliminado correctamente' }
}

// ─── PHC ────────────────────────────────────────────────────────

const getSalarioEmpleado = async (id_empleado) => {
    const confirmado = 2
    const { data, error } = await supabase
        .from('personas_horario_cargo')
        .select(`
      salario,
      estados(nombre),
      cargo(nombre),
      horarios(*)
    `)
        .eq('id_empleado', id_empleado)
        .eq('id_estado', confirmado)
        .single();
    if (error) throw new Error(error.message)
    return data
}

// Novedades
const getAllNovedades = async () => {
    const { data, error } = await supabase
        .from('novedades')
        .select('*, estados(nombre)')
    if (error) throw new Error(error.message)
    return data
}
const searchNovedades = async (search = '', tipo_novedad = '') => {
    let query = supabase
        .from('novedades')
        .select('*, estados(nombre)')

    if (search && search.trim()) {
        query = query.ilike('nombre', `%${search.trim()}%`)
    }

    if (tipo_novedad && tipo_novedad.trim()) {
        query = query.eq('tipo_novedad', tipo_novedad.trim())
    }

    const { data, error } = await query.limit(10).order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

const getNovedad = async (id) => {
    const { data, error } = await supabase
        .from('novedades')
        .select('*, estados(nombre)')
        .eq('id_novedad', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const postNovedad = async (nombre, tipo_novedad, formula, clase, es_fijo, id_estado) => {
    const { data, error } = await supabase
        .from('novedades')
        .insert({ nombre, tipo_novedad, formula, clase, es_fijo, id_estado })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const updateNovedad = async (id, datos) => {
    const actualizar = Object.fromEntries(
        Object.entries(datos).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data, error } = await supabase
        .from('novedades')
        .update(actualizar)
        .eq('id_novedad', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const updateEstadoNovedad = async (id, id_estado) => {
    const { data, error } = await supabase
        .from('novedades')
        .update({ id_estado })
        .eq('id_novedad', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export default { getAllProcesos, getProceso, postProceso, updateEstadoProceso, getAllPagos, getPago, getPagosByEmpleado, getPagosByProceso, getTablePagos, postPago, updatePago, updateEstadoPago, deletePago, getSalarioEmpleado, getAllNovedades, searchNovedades , getNovedad, postNovedad, updateNovedad, updateEstadoNovedad }