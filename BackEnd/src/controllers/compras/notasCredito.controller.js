import notasCreditoService from '../../services/compras/notasCredito.service.js'

const getNextCodigo = async (req, res) => {
  try {
    const codigo = await notasCreditoService.getNextCodigo()
    res.json({ codigo_nota_credito: codigo })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const createNotaCredito = async (req, res) => {
  try {
    const result = await notasCreditoService.createNotaCredito(req.body)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const getNotasByFactura = async (req, res) => {
  try {
    const data = await notasCreditoService.getNotasByFactura(Number(req.params.id_factura))
    res.json(data)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export default { getNextCodigo, createNotaCredito, getNotasByFactura }