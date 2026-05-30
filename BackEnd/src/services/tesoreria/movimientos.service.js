import supabase from '../../config/supabase.js'

const SELECT_FULL = `
  *,
  cuentas_bancarias!movimientos_bancarios_id_cuenta_bancaria_fkey(*, bancos(*)),
  cuentas_bancarias!movimientos_bancarios_id_cuenta_destino_fkey(*, bancos(*)),
  tipos_movimiento_bancario(*),
  facturas_ventas(codigo_factura),
  facturas_compras(codigo_factura),
  estados(nombre)
`

const getAllMovimientos = async () => {
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .select(SELECT_FULL)
  if (error) throw new Error(error.message)
  return data
}

const getMovimiento = async (id) => {
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .select(SELECT_FULL)
    .eq('id_movimiento', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const getTableMovimientos = async () => {
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .select(`
      id_movimiento,
      fecha,
      tipo,
      monto,
      cuentas_bancarias!movimientos_bancarios_id_cuenta_bancaria_fkey(*, bancos(*)),
      tipos_movimiento_bancario(nombre, naturaleza),
      estados(nombre)
    `)
  if (error) throw new Error(error.message)
  return data
}

const postMovimiento = async (id_cuenta_bancaria, id_asiento, id_factura_venta, id_factura_compra, fecha, fecha_conciliacion, tipo, monto, id_tipo_movimiento, id_cuenta_destino, id_estado) => {
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .insert({ id_cuenta_bancaria, id_asiento, id_factura_venta, id_factura_compra, fecha, fecha_conciliacion, tipo, monto, id_tipo_movimiento, id_cuenta_destino, id_estado })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const updateMovimiento = async (id, datos) => {
  const actualizarMovimiento = Object.fromEntries(
    Object.entries(datos).filter(([_, v]) => v !== undefined && v !== '')
  )
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .update(actualizarMovimiento)
    .eq('id_movimiento', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const updateEstadoMovimiento = async (id, id_estado) => {
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .update({ id_estado })
    .eq('id_movimiento', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const deleteMovimiento = async (id) => {
  const { error } = await supabase
    .from('movimientos_bancarios')
    .delete()
    .eq('id_movimiento', id)
  if (error) throw new Error(error.message)
  return { message: 'Movimiento eliminado correctamente' }
}

// ─── CUENTAS BANCARIAS ──────────────────────────────────────────

const getAllCuentas = async () => {
  const { data, error } = await supabase
    .from('cuentas_bancarias')
    .select('*, bancos(*)')
  if (error) throw new Error(error.message)
  return data
}

const getCuenta = async (id) => {
  const { data, error } = await supabase
    .from('cuentas_bancarias')
    .select('*, bancos(*)')
    .eq('id_cuenta_bancaria', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const postCuenta = async (nro_cuenta, titular, tipo_cuenta, saldo_contable, saldo_disponible, id_banco) => {
  const { data, error } = await supabase
    .from('cuentas_bancarias')
    .insert({ nro_cuenta, titular, tipo_cuenta, saldo_contable, saldo_disponible, id_banco })
    .select('*, bancos(*)')
    .single()
  if (error) throw new Error(error.message)
  return data
}

const updateCuenta = async (id, datos) => {
  const actualizarCuenta = Object.fromEntries(
    Object.entries(datos).filter(([_, v]) => v !== undefined && v !== '')
  )
  const { data, error } = await supabase
    .from('cuentas_bancarias')
    .update(actualizarCuenta)
    .eq('id_cuenta_bancaria', id)
    .select('*, bancos(*)')
    .single()
  if (error) throw new Error(error.message)
  return data
}


const deleteCuenta = async (id) => {
  const { error } = await supabase
    .from('cuentas_bancarias')
    .delete()
    .eq('id_cuenta_bancaria', id)
  if (error) throw new Error(error.message)
  return { message: 'Cuenta eliminada correctamente' }
}

export default { getAllMovimientos, getMovimiento, getTableMovimientos, postMovimiento, updateMovimiento, updateEstadoMovimiento, deleteMovimiento, getAllCuentas, getCuenta, postCuenta, updateCuenta, deleteCuenta }