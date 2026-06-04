import cuentasService from '../../services/contabilidad/cuentas.service.js'

const getCuentas = async (_req, res) => {
  try { res.status(200).json(await cuentasService.listarCuentas()) }
  catch (e) { res.status(400).json({ message: e.message }) }
}

const getCuenta = async (req, res) => {
  try {
    const c = await cuentasService.obtenerCuenta(req.params.codigo)
    if (!c) return res.status(404).json({ message: 'Cuenta no encontrada' })
    res.status(200).json(c)
  } catch (e) { res.status(400).json({ message: e.message }) }
}

const postCuenta = async (req, res) => {
  try {
    const datos = req.body
    if (!datos.codigo || !datos.cuenta)
      return res.status(400).json({ message: 'Código y nombre de cuenta requeridos' })
    res.status(201).json(await cuentasService.crearCuenta(datos))
  } catch (e) { res.status(400).json({ message: e.message }) }
}

const putCuenta = async (req, res) => {
  try {
    const { codigo } = req.params
    if (!codigo) return res.status(400).json({ message: 'Código requerido' })
    res.status(200).json(await cuentasService.actualizarCuenta(codigo, req.body))
  } catch (e) { res.status(400).json({ message: e.message }) }
}

const deleteCuenta = async (req, res) => {
  try {
    const { codigo } = req.params
    if (!codigo) return res.status(400).json({ message: 'Código requerido' })
    res.status(200).json(await cuentasService.eliminarCuenta(codigo))
  } catch (e) { res.status(400).json({ message: e.message }) }
}

export default { getCuentas, getCuenta, postCuenta, putCuenta, deleteCuenta }
