import presupuestosService from '../../services/ventas/presupuestos.service.js'

const listarPresupuestos = async (req, res) => {
  try {
    const presupuestos = await presupuestosService.getAllPresupuestosTabla()
    res.status(200).json(presupuestos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const obtenerPresupuesto = async (req, res) => {
  try {
    const { id } = req.params
    const presupuesto = await presupuestosService.getPresupuesto(id)
    res.status(200).json({
      message: 'Presupuesto obtenido',
      presupuesto
    })
  } catch (error) {
    const status = error.message === 'Presupuesto no encontrado' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const obtenerDetallePresupuesto = async (req, res) => {
  try {
    const { id } = req.params
    const detalle = await presupuestosService.getDetallePresupuesto(id)
    res.status(200).json({
      message: 'Detalle de presupuesto obtenido',
      detalle
    })
  } catch (error) {
    const status = error.message === 'Presupuesto no encontrado' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

const crearPresupuesto = async (req, res) => {
  try {
    const { codigo_presupuesto, fecha_creacion, id_cliente, id_estado } = req.body

    if (!id_cliente || !fecha_creacion) {
      return res.status(400).json({ message: 'Faltan datos requeridos' })
    }

    const presupuesto = await presupuestosService.createPresupuesto({
      id_cliente,
      fecha_creacion,
      id_estado
    })

    res.status(201).json({
      message: 'Presupuesto creado correctamente',
      id_presupuesto: presupuesto.id_presupuesto
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const crearDetallePresupuesto = async (req, res) => {
  try {
    const detalles = req.body

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: 'detalles debe ser un array no vacío' })
    }

    const resultado = await presupuestosService.createDetallePresupuesto(detalles)

    res.status(201).json({
      message: 'Detalles del presupuesto creados correctamente',
      detalles: resultado
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  listarPresupuestos,
  obtenerPresupuesto,
  obtenerDetallePresupuesto,
  crearPresupuesto,
  crearDetallePresupuesto
}
