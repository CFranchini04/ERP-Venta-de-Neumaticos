import asientosService from '../../services/contabilidad/asientos.service.js'

const getAsientos = async (req, res) => {
  try { res.json(await asientosService.listarAsientos(req.query.desde, req.query.hasta)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const getAsiento = async (req, res) => {
  try {
    const a = await asientosService.obtenerAsiento(req.params.id)
    if (!a) return res.status(404).json({ message: 'No encontrado' })
    res.json(a)
  } catch (e) { res.status(400).json({ message: e.message }) }
}

const postAsiento = async (req, res) => {
  try { res.status(201).json(await asientosService.crearAsiento(req.body)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const putAsiento = async (req, res) => {
  try { res.json(await asientosService.actualizarAsiento(req.params.id, req.body)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const deleteAsiento = async (req, res) => {
  try { res.json(await asientosService.eliminarAsiento(req.params.id)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

export default { getAsientos, getAsiento, postAsiento, putAsiento, deleteAsiento }
