import clientesService from '../../services/ventas/clientes.service.js'

const searchClientes = async (req, res) => {
  try {
    const clientes = await clientesService.getAllClientes()
    res.status(200).json(clientes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getCliente = async (req, res) => {
  try {
    const { id } = req.params
    const cliente = await clientesService.getCliente(id)
    res.status(200).json(cliente)
  } catch (error) {
    const status = error.message === 'Cliente no encontrado' ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

export default { searchClientes, getCliente }
