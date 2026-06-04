import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import periodosService from './periodos.service.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.resolve(__dirname, '../../data/contabilidad/planDeCuentas.json')

const leer = async () => JSON.parse(await readFile(FILE, 'utf8'))
const escribir = (d) => writeFile(FILE, JSON.stringify(d, null, 2), 'utf8')

const sortByCodigo = (a, b) => {
  const pa = a.codigo.split('.').map(Number)
  const pb = b.codigo.split('.').map(Number)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0, vb = pb[i] ?? 0
    if (va !== vb) return va - vb
  }
  return 0
}

const hoy = () => new Date().toISOString().slice(0, 10)

const listarCuentas = async () => (await leer()).sort(sortByCodigo)

const obtenerCuenta = async (codigo) =>
  (await leer()).find(c => c.codigo === codigo) ?? null

const crearCuenta = async ({ codigo, cuenta, imputable }) => {
  if (!codigo || !cuenta) throw new Error('Código y cuenta son obligatorios')
  await periodosService.validarPeriodoAbierto(hoy())

  const cuentas = await leer()
  if (cuentas.some(c => c.codigo === codigo))
    throw new Error(`Ya existe una cuenta con código ${codigo}`)

  const nueva = {
    codigo, cuenta,
    imputable: !!imputable,
    ...(imputable ? { saldo: 0 } : {}),
  }
  cuentas.push(nueva)
  await escribir(cuentas.sort(sortByCodigo))
  return nueva
}

const actualizarCuenta = async (codigo, cambios) => {
  await periodosService.validarPeriodoAbierto(hoy())
  const cuentas = await leer()
  const idx = cuentas.findIndex(c => c.codigo === codigo)
  if (idx === -1) throw new Error(`Cuenta ${codigo} no encontrada`)

  const { codigo: _, ...resto } = cambios
  const limpios = Object.fromEntries(
    Object.entries(resto).filter(([__, v]) => v !== undefined && v !== '')
  )
  cuentas[idx] = { ...cuentas[idx], ...limpios, codigo }
  await escribir(cuentas)
  return cuentas[idx]
}

const eliminarCuenta = async (codigo) => {
  await periodosService.validarPeriodoAbierto(hoy())
  const cuentas = await leer()
  if (cuentas.some(c => c.codigo.startsWith(codigo + '.')))
    throw new Error('No se puede eliminar: la cuenta tiene subcuentas')
  const filtradas = cuentas.filter(c => c.codigo !== codigo)
  if (filtradas.length === cuentas.length) throw new Error(`Cuenta ${codigo} no encontrada`)
  await escribir(filtradas)
  return { codigo, message: 'Cuenta eliminada correctamente' }
}

export default { listarCuentas, obtenerCuenta, crearCuenta, actualizarCuenta, eliminarCuenta }
