import planInicial from '../../data/contabilidad/planDeCuentas.json' with { type: 'json' };


let cuentas = planInicial.map(c => ({ ...c }))


const sortByCodigo = (a, b) => {
  const pa = a.codigo.split('.').map(Number)
  const pb = b.codigo.split('.').map(Number)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0
    const vb = pb[i] ?? 0
    if (va !== vb) return va - vb
  }
  return 0
}

const listarCuentas = async () => {
  return [...cuentas].sort(sortByCodigo)
}

const obtenerCuenta = async (codigo) => {
  const cuenta = cuentas.find(c => c.codigo === codigo)
  return cuenta ?? null
}

const crearCuenta = async (datos) => {
  const { codigo, cuenta, imputable } = datos

  if (!codigo || !cuenta) {
    throw new Error('Código y cuenta son obligatorios')
  }

  const existe = cuentas.some(c => c.codigo === codigo)
  if (existe) {
    throw new Error(`Ya existe una cuenta con código ${codigo}`)
  }

  const nueva = {
    codigo,
    cuenta,
    imputable: !!imputable,
    ...(imputable ? { saldo: 0 } : {})
  }

  cuentas.push(nueva)
  return nueva
}

const actualizarCuenta = async (codigo, cambios) => {
  const idx = cuentas.findIndex(c => c.codigo === codigo)
  if (idx === -1) throw new Error(`Cuenta ${codigo} no encontrada`)

  const { codigo: _, ...datosAActualizar } = cambios

  const datosLimpios = Object.fromEntries(
    Object.entries(datosAActualizar).filter(([_, v]) => v !== undefined && v !== '')
  )

  cuentas[idx] = { ...cuentas[idx], ...datosLimpios, codigo }
  return cuentas[idx]
}

const eliminarCuenta = async (codigo) => {
  const prefijo = codigo + '.'
  const tieneHijos = cuentas.some(c => c.codigo.startsWith(prefijo))
  if (tieneHijos) {
    throw new Error('No se puede eliminar: la cuenta tiene subcuentas')
  }

  const longitudInicial = cuentas.length
  cuentas = cuentas.filter(c => c.codigo !== codigo)

  if (cuentas.length === longitudInicial) {
    throw new Error(`Cuenta ${codigo} no encontrada`)
  }

  return { codigo, message: 'Cuenta eliminada correctamente' }
}

export default {
  listarCuentas,
  obtenerCuenta,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta
}