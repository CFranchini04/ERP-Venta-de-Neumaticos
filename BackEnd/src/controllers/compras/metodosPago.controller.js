import metodosPagoService from '../../services/compras/metodosPago.service.js'

const getAllMetodosPago = async (req, res) => {
    try {
        const metodos = await metodosPagoService.getAllMetodosPago()
        res.status(200).json(metodos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllMetodosPago }
