import cuentasService from '../../services/contabilidad/cuentas.service.js'

const getCuentas = async (_req, res) => {
  try {
    const cuentas = await cuentasService.listarCuentas()
    res.status(200).json(cuentas)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getCuenta = async (req, res) => {
  try {
    const { codigo } = req.params
    const cuenta = await cuentasService.obtenerCuenta(codigo)
    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' })
    res.status(200).json(cuenta)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const postCuenta = async (req, res) => {
  try {
    const datos = req.body
    if (!datos.codigo || !datos.cuenta) {
      return res.status(400).json({ message: 'Código y nombre de cuenta requeridos' })
    }
    const nuevaCuenta = await cuentasService.crearCuenta(datos)
    res.status(201).json(nuevaCuenta)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const putCuenta = async (req, res) => {
  try {
    const { codigo } = req.params
    const datos = req.body
    if (!codigo) return res.status(400).json({ message: 'Código requerido' })
    const cuentaActualizada = await cuentasService.actualizarCuenta(codigo, datos)
    res.status(200).json(cuentaActualizada)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteCuenta = async (req, res) => {
  try {
    const { codigo } = req.params
    if (!codigo) return res.status(400).json({ message: 'Código requerido' })
    const resultado = await cuentasService.eliminarCuenta(codigo)
    res.status(200).json(resultado)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export default {
  getCuentas,
  getCuenta,
  postCuenta,
  putCuenta,
  deleteCuenta
}