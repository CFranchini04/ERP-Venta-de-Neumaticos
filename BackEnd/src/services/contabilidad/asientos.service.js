import asientosIniciales from '../../data/contabilidad/asientosMock.json' with { type: 'json' };
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import periodosService from './periodos.service.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.resolve(__dirname, '../../data/contabilidad/asientosMock.json')

const leer = async () => JSON.parse(await readFile(FILE, 'utf8'))
const escribir = (d) => writeFile(FILE, JSON.stringify(d, null, 2), 'utf8')

const validarBalanceado = (lineas) => {
  const debe  = lineas.reduce((s, l) => s + (Number(l.debe)  || 0), 0)
  const haber = lineas.reduce((s, l) => s + (Number(l.haber) || 0), 0)
  if (Math.abs(debe - haber) > 0.01) throw new Error('El asiento no está balanceado (Σdebe ≠ Σhaber)')
  if (debe === 0) throw new Error('El asiento no puede tener importes en cero')
}

const listarAsientos = async (desde, hasta) => {
  const asientos = await leer()
  return asientos
    .filter(a => (!desde || a.fecha >= desde) && (!hasta || a.fecha <= hasta))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.numero - b.numero)
}

const obtenerAsiento = async (id) => {
  const asientos = await leer()
  return asientos.find(a => a.id === Number(id)) ?? null
}

const crearAsiento = async ({ fecha, concepto, lineas, origen = null }) => {
  if (!fecha || !concepto || !Array.isArray(lineas) || lineas.length < 2)
    throw new Error('fecha, concepto y al menos 2 líneas son obligatorios')
  validarBalanceado(lineas)
  await periodosService.validarPeriodoAbierto(fecha)

  const asientos = await leer()
  const id     = asientos.length ? Math.max(...asientos.map(a => a.id)) + 1 : 1
  const numero = asientos.length ? Math.max(...asientos.map(a => a.numero)) + 1 : 1

  const nuevo = { id, numero, fecha, concepto, lineas, origen }
  asientos.push(nuevo)
  await escribir(asientos)
  return nuevo
}

const actualizarAsiento = async (id, cambios) => {
  const asientos = await leer()
  const idx = asientos.findIndex(a => a.id === Number(id))
  if (idx === -1) throw new Error(`Asiento ${id} no encontrado`)
  if (cambios.lineas) validarBalanceado(cambios.lineas)
  const fechaFinal = cambios.fecha ?? asientos[idx].fecha
  await periodosService.validarPeriodoAbierto(fechaFinal)
  asientos[idx] = { ...asientos[idx], ...cambios, id: asientos[idx].id }
  await escribir(asientos)
  return asientos[idx]
}

const eliminarAsiento = async (id) => {
  const asientos = await leer()
  const a = asientos.find(x => x.id === Number(id))
  if (!a) throw new Error(`Asiento ${id} no encontrado`)
  await periodosService.validarPeriodoAbierto(a.fecha)
  const filtrados = asientos.filter(x => x.id !== Number(id))
  await escribir(filtrados)
  return { id: Number(id) }
}

export default {
  listarAsientos,
  obtenerAsiento,
  crearAsiento,
  actualizarAsiento,
  eliminarAsiento,
}
