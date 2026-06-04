import modelosService from '../../services/contabilidad/modelosAsiento.service.js'

const getModelos = async (req, res) => {
  try { res.json(await modelosService.listarModelos(req.query.modulo)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const getModelo = async (req, res) => {
  try { res.json(await modelosService.obtenerModelo(req.params.modulo, req.params.evento)) }
  catch (e) { res.status(404).json({ message: e.message }) }
}

const postModelo = async (req, res) => {
  try { res.status(201).json(await modelosService.crearModelo(req.body)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const putModelo = async (req, res) => {
  try { res.json(await modelosService.actualizarModelo(req.params.modulo, req.params.evento, req.body)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const deleteModelo = async (req, res) => {
  try { res.json(await modelosService.eliminarModelo(req.params.modulo, req.params.evento)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

export default { getModelos, getModelo, postModelo, putModelo, deleteModelo }
