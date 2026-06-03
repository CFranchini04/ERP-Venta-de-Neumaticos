import movimientosService from '../../services/tesoreria/movimientos.service.js'

const getAllMovimientos = async (req, res) => {
    try {
        const movimientos = await movimientosService.getAllMovimientos()
        res.status(200).json(movimientos)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getMovimiento = async (req, res) => {
    try {
        const { id } = req.params
        const movimiento = await movimientosService.getMovimiento(id)
        res.status(200).json(movimiento)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getTableMovimientos = async (req, res) => {
    try {
        const tabla = await movimientosService.getTableMovimientos()
        res.status(200).json(tabla)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// En movimientos.controller.js — reemplazar postMovimiento:

const postMovimiento = async (req, res) => {
    try {
        const {
            id_cuenta_bancaria, id_asiento, id_factura_venta, id_factura_compra,
            fecha, fecha_conciliacion, tipo, monto, id_tipo_movimiento,
            id_cuenta_destino, id_estado, observacion
        } = req.body

        if (!id_cuenta_bancaria || !monto || !id_tipo_movimiento)
            return res.status(400).json({ message: 'Faltan datos requeridos' })

        const movimiento = await movimientosService.postMovimiento({
            id_cuenta_bancaria,
            id_asiento: id_asiento ?? null,
            id_factura_venta: id_factura_venta ?? null,
            id_factura_compra: id_factura_compra ?? null,
            fecha,
            fecha_conciliacion: fecha_conciliacion ?? null,
            tipo,
            monto,
            id_tipo_movimiento,
            id_cuenta_destino: id_cuenta_destino ?? null,
            id_estado: id_estado ?? null,
            observacion: observacion ?? null,
        })

        res.status(201).json(movimiento)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
const updateMovimiento = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const movimiento = await movimientosService.updateMovimiento(id, datos)
        res.status(200).json(movimiento)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateEstadoMovimiento = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado } = req.body
        if (!id || !id_estado) return res.status(400).json({ message: 'Id y estado requeridos' })
        const movimiento = await movimientosService.updateEstadoMovimiento(id, id_estado)
        res.status(200).json(movimiento)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteMovimiento = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await movimientosService.deleteMovimiento(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// ─── CUENTAS BANCARIAS ──────────────────────────────────────────

const getAllCuentas = async (req, res) => {
    try {
        const cuentas = await movimientosService.getAllCuentas()
        res.status(200).json(cuentas)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getCuenta = async (req, res) => {
    try {
        const { id } = req.params
        const cuenta = await movimientosService.getCuenta(id)
        res.status(200).json(cuenta)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const postCuenta = async (req, res) => {
    try {
        const { nro_cuenta, titular, tipo_cuenta, saldo_contable, saldo_disponible, id_banco } = req.body
        if (!nro_cuenta || !titular || !id_banco)
            return res.status(400).json({ message: 'Faltan datos requeridos' })
        const cuenta = await movimientosService.postCuenta(nro_cuenta, titular, tipo_cuenta, saldo_contable, saldo_disponible, id_banco)
        res.status(201).json(cuenta)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const updateCuenta = async (req, res) => {
    try {
        const { id } = req.params
        const datos = req.body
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const cuenta = await movimientosService.updateCuenta(id, datos)
        res.status(200).json(cuenta)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


const deleteCuenta = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Id requerido' })
        const resultado = await movimientosService.deleteCuenta(id)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// BANCOS
const getAllBancos = async (req, res) => {
    try {
        const data = await movimientosService.getAllBancos()
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getBanco = async (req, res) => {
    try {
        const data = await movimientosService.getBanco(req.params.id)
        res.json(data)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

const postBanco = async (req, res) => {
    try {
        const { nombre } = req.body
        if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' })
        const data = await movimientosService.postBanco(nombre)
        res.status(201).json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateBanco = async (req, res) => {
    try {
        const { nombre } = req.body
        if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' })
        const data = await movimientosService.updateBanco(req.params.id, nombre)
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const deleteBanco = async (req, res) => {
    try {
        const data = await movimientosService.deleteBanco(req.params.id)
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
export default {
    getAllMovimientos, getMovimiento, getTableMovimientos, postMovimiento, updateMovimiento, updateEstadoMovimiento, deleteMovimiento,
    getAllCuentas, getCuenta, postCuenta, updateCuenta, deleteCuenta,
    getAllBancos, getBanco, postBanco, updateBanco, deleteBanco
}