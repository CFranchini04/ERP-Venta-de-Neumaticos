import supabase from '../../config/supabase.js'

const SELECT_FULL = `
  *,
  cuenta_origen:cuentas_bancarias!movimientos_bancarios_id_cuenta_bancaria_fkey(*, bancos(*)),
  cuenta_destino:cuentas_bancarias!movimientos_bancarios_id_cuenta_destino_fkey(*, bancos(*)),
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
      id_tipo_movimiento,
      cuentas_bancarias!movimientos_bancarios_id_cuenta_bancaria_fkey(*, bancos(*)),
      tipos_movimiento_bancario(nombre, naturaleza),
      estados(nombre)
    `)
  if (error) throw new Error(error.message)
  return data
}

const postMovimiento = async (datos) => {
  const { data, error } = await supabase
    .from('movimientos_bancarios')
    .insert(datos)
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

// BANCOS
const getAllBancos = async () => {
  const { data, error } = await supabase
    .from('bancos')
    .select('*')
  if (error) throw new Error(error.message)
  return data
}

const getBanco = async (id) => {
  const { data, error } = await supabase
    .from('bancos')
    .select('*')
    .eq('id_banco', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

const postBanco = async (nombre) => {
  const { data, error } = await supabase
    .from('bancos')
    .insert({ nombre })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const updateBanco = async (id, nombre) => {
  const { data, error } = await supabase
    .from('bancos')
    .update({ nombre })
    .eq('id_banco', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const deleteBanco = async (id) => {
  const { error } = await supabase
    .from('bancos')
    .delete()
    .eq('id_banco', id)
  if (error) throw new Error(error.message)
  return { deleted: true }
}

export default {
  getAllMovimientos, getMovimiento, getTableMovimientos, postMovimiento, updateMovimiento, updateEstadoMovimiento, deleteMovimiento,
  getAllCuentas, getCuenta, postCuenta, updateCuenta, deleteCuenta,
  getAllBancos, getBanco, postBanco, updateBanco, deleteBanco
}