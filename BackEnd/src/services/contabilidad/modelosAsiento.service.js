import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.resolve(__dirname, '../../data/contabilidad/modelosAsiento.json')

const leer = async () => JSON.parse(await readFile(FILE, 'utf8'))
const escribir = (d) => writeFile(FILE, JSON.stringify(d, null, 2), 'utf8')

const listarModelos = async (modulo) => {
  const data = await leer()
  return modulo ? data.filter(m => m.modulo === modulo) : data
}

const obtenerModelo = async (modulo, evento) => {
  const data = await leer()
  const m = data.find(x => x.modulo === modulo && x.evento === evento)
  if (!m) throw new Error(`No existe modelo de asiento para ${modulo}/${evento}`)
  return m
}

const crearModelo = async (modelo) => {
  if (!modelo.modulo || !modelo.evento || !Array.isArray(modelo.lineas))
    throw new Error('modulo, evento y lineas son obligatorios')
  const data = await leer()
  if (data.some(m => m.modulo === modelo.modulo && m.evento === modelo.evento))
    throw new Error(`Ya existe modelo ${modelo.modulo}/${modelo.evento}`)
  data.push(modelo)
  await escribir(data)
  return modelo
}

const actualizarModelo = async (modulo, evento, cambios) => {
  const data = await leer()
  const idx = data.findIndex(m => m.modulo === modulo && m.evento === evento)
  if (idx === -1) throw new Error(`Modelo ${modulo}/${evento} no encontrado`)
  data[idx] = { ...data[idx], ...cambios, modulo, evento }
  await escribir(data)
  return data[idx]
}

const eliminarModelo = async (modulo, evento) => {
  const data = await leer()
  const filtrados = data.filter(m => !(m.modulo === modulo && m.evento === evento))
  if (filtrados.length === data.length) throw new Error(`Modelo ${modulo}/${evento} no encontrado`)
  await escribir(filtrados)
  return { modulo, evento }
}

export default { listarModelos, obtenerModelo, crearModelo, actualizarModelo, eliminarModelo }
