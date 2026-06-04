import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.resolve(__dirname, '../../data/contabilidad/periodos.json')

const leer = async () => JSON.parse(await readFile(FILE, 'utf8'))
const escribir = (d) => writeFile(FILE, JSON.stringify(d, null, 2), 'utf8')

const listarPeriodos = async () => (await leer()).sort((a, b) => b.anio - a.anio)

const obtenerPeriodo = async (id) =>
  (await leer()).find(p => p.id === Number(id)) ?? null

const obtenerPeriodoPorFecha = async (fecha) =>
  (await leer()).find(p => fecha >= p.inicio && fecha <= p.fin) ?? null

const crearPeriodo = async ({ anio, inicio, fin }) => {
  if (!anio || !inicio || !fin) throw new Error('anio, inicio y fin son obligatorios')
  const data = await leer()
  if (data.some(p => p.anio === Number(anio))) throw new Error(`Ya existe el período ${anio}`)
  const id = data.length ? Math.max(...data.map(p => p.id)) + 1 : 1
  const nuevo = { id, anio: Number(anio), inicio, fin, estado: 'abierto' }
  data.push(nuevo)
  await escribir(data)
  return nuevo
}

const cambiarEstado = async (id, estado) => {
  if (!['abierto', 'cerrado'].includes(estado)) throw new Error('Estado inválido')
  const data = await leer()
  const idx = data.findIndex(p => p.id === Number(id))
  if (idx === -1) throw new Error(`Período ${id} no encontrado`)
  data[idx].estado = estado
  await escribir(data)
  return data[idx]
}

const eliminarPeriodo = async (id) => {
  const data = await leer()
  const filtrados = data.filter(p => p.id !== Number(id))
  if (filtrados.length === data.length) throw new Error(`Período ${id} no encontrado`)
  await escribir(filtrados)
  return { id: Number(id) }
}

// Helper de gate — para usar desde otros services
export const validarPeriodoAbierto = async (fecha) => {
  const p = await obtenerPeriodoPorFecha(fecha)
  if (!p) throw new Error(`No existe período contable para la fecha ${fecha}`)
  if (p.estado === 'cerrado') throw new Error(`El período ${p.anio} está cerrado`)
  return p
}

export default {
  listarPeriodos,
  obtenerPeriodo,
  obtenerPeriodoPorFecha,
  crearPeriodo,
  cambiarEstado,
  eliminarPeriodo,
  validarPeriodoAbierto,
}
