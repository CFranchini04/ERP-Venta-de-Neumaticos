import asientosService from '../../services/contabilidad/asientos.service.js'

const getAsientos = async (req, res) => {
  try {
    const { desde, hasta } = req.query || {}
    const asientos = await asientosService.listarAsientos({ desde, hasta })
    res.status(200).json(asientos)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getAsiento = async (req, res) => {
  try {
    const { id } = req.params
    const asiento = await asientosService.obtenerAsiento(id)
    if (!asiento) {
      return res.status(404).json({ message: 'Asiento no encontrado' })
    }
    res.status(200).json(asiento)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const postAsiento = async (req, res) => {
  try {
    const datos = req.body
    const nuevoAsiento = await asientosService.crearAsiento(datos)
    res.status(201).json(nuevoAsiento)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const putAsiento = async (req, res) => {
  try {
    const { id } = req.params
    const datos = req.body
    if (!id) return res.status(400).json({ message: 'Id requerido' })
    
    const asientoActualizado = await asientosService.actualizarAsiento(id, datos)
    res.status(200).json(asientoActualizado)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteAsiento = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: 'Id requerido' })
    
    const resultado = await asientosService.eliminarAsiento(id)
    res.status(200).json(resultado)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export default {
  getAsientos,
  getAsiento,
  postAsiento,
  putAsiento,
  deleteAsiento
}