import periodosService from '../../services/contabilidad/periodos.service.js'

const getPeriodos = async (_req, res) => {
  try { res.json(await periodosService.listarPeriodos()) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const getPeriodo = async (req, res) => {
  try {
    const p = await periodosService.obtenerPeriodo(req.params.id)
    if (!p) return res.status(404).json({ message: 'No encontrado' })
    res.json(p)
  } catch (e) { res.status(400).json({ message: e.message }) }
}

const postPeriodo = async (req, res) => {
  try { res.status(201).json(await periodosService.crearPeriodo(req.body)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const patchEstado = async (req, res) => {
  try { res.json(await periodosService.cambiarEstado(req.params.id, req.body.estado)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const deletePeriodo = async (req, res) => {
  try { res.json(await periodosService.eliminarPeriodo(req.params.id)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

export default { getPeriodos, getPeriodo, postPeriodo, patchEstado, deletePeriodo }
