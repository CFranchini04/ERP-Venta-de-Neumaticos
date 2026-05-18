import proveedoresService from '../../services/compras/proveedores.service.js'

const getAllProveedores = async (req, res) => {
  try {
    const proveedores = await proveedoresService.getAllProveedores()
    res.status(200).json(proveedores)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getProveedores = async (req, res) => {
  try {
    const { id } = req.params
    const proveedor = await proveedoresService.getProveedores(id)
    res.status(200).json(proveedor)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getProveedorByNombre = async (req, res) => {
  try {
    const { nombre } = req.params
    const proveedores = await proveedoresService.getProveedorByNombre(nombre)
    res.status(200).json(proveedores)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getProveedorByRuc = async (req, res) => {
  try {
    const { ruc } = req.params
    const proveedor = await proveedoresService.getProveedorByRuc(ruc)
    res.status(200).json(proveedor)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const postProveedor = async (req, res) => {
  try {
    const { plazo, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento } = req.body

    if (!nombre || !ruc)
      return res.status(400).json({ message: 'Nombre y RUC requeridos' })

    const proveedor = await proveedoresService.postProveedor(plazo, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento)
    res.status(201).json(proveedor)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params
    const datos = req.body
    if (!id) return res.status(400).json({ message: 'Id requerido' })
    const proveedor = await proveedoresService.updateProveedor(id, datos)
    res.status(200).json(proveedor)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: 'Id requerido' })
    const resultado = await proveedoresService.deleteProveedor(id)
    res.status(200).json(resultado)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export default { getAllProveedores, getProveedores, getProveedorByNombre, getProveedorByRuc, postProveedor, updateProveedor, deleteProveedor }