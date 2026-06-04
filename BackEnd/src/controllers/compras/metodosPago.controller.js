import metodosPagoService from '../../services/compras/metodosPago.service.js'

const getAllMetodosPago = async (req, res) => {
    try {
        const data = await metodosPagoService.getAllMetodosPago()
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getMetodoPago = async (req, res) => {
    try {
        const data = await metodosPagoService.getMetodoPago(req.params.id)
        res.status(200).json(data)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

const createMetodoPago = async (req, res) => {
    try {
        const { nombre } = req.body
        const data = await metodosPagoService.createMetodoPago(nombre)
        res.status(201).json(data)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateMetodoPago = async (req, res) => {
    try {
        const { nombre } = req.body
        const data = await metodosPagoService.updateMetodoPago(req.params.id, nombre)
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteMetodoPago = async (req, res) => {
    try {
        const result = await metodosPagoService.deleteMetodoPago(req.params.id)
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export default { getAllMetodosPago, getMetodoPago, createMetodoPago, updateMetodoPago, deleteMetodoPago }