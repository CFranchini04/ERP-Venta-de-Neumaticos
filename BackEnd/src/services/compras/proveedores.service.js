import supabase from '../../config/supabase.js'

const getAllProveedores = async () => {
    const { data, error } = await supabase
        .from('proveedores')
        .select('*, personas(*)')
    if (error) throw new Error(error.message)
    return data
}

const getProveedores = async (id) => {
    const { data, error } = await supabase
        .from('proveedores')
        .select('*, personas(*)')
        .eq('id_proveedor', id)
    if (error) throw new Error(error.message)
    return data
}

const searchProveedores = async (search = '') => {
    let query = supabase
        .from('proveedores')
        .select('*, personas(*)')

    if (search && search.trim()) {
        query = query.ilike('personas.nombre', `%${search.trim()}%`)
    }

    const { data, error } = await query.limit(10)
    if (error) throw new Error(error.message)
    return data.filter(p => p.personas !== null)
}

const getProveedorByNombre = async (nombre) => {
    const { data, error } = await supabase
        .from('proveedores')
        .select('*, personas(*)')
        .ilike('personas.nombre', `%${nombre}%`)
    if (error) throw new Error(error.message)
    return data
}

const getProveedorByRuc = async (ruc) => {
    const { data, error } = await supabase
        .from('proveedores')
        .select('*, personas(*)')
        .eq('personas.ruc', ruc)
    if (error) throw new Error(error.message)
    return data
}

const postProveedor = async (plazo, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento) => {
    const { data: persona, error: errorPer } = await supabase
        .from('personas')
        .insert({ nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento })
        .select()
        .single()
    if (errorPer) throw new Error(errorPer.message)

    const { data: proveedor, error: errorProv } = await supabase
        .from('proveedores')
        .insert({ plazo_entrega: plazo, id_persona: persona.id_persona })
        .select()
        .single()
    if (errorProv) throw new Error(errorProv.message)
    return proveedor
}

const updateProveedor = async (id, data) => {
    const { plazo_entrega, ...datosPersona } = data

    const { data: provExistente, error: errorBuscar } = await supabase
        .from('proveedores')
        .select('id_persona')
        .eq('id_proveedor', id)
        .single()
    if (errorBuscar) throw new Error(errorBuscar.message)

    const id_persona = provExistente.id_persona

    const actualizarPersona = Object.fromEntries(
        Object.entries(datosPersona).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: persona, error: errorPer } = await supabase
        .from('personas')
        .update(actualizarPersona)
        .eq('id_persona', id_persona)
        .select()
        .single()
    if (errorPer) throw new Error(errorPer.message)

    const actualizarProveedor = Object.fromEntries(
        Object.entries({ plazo_entrega }).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: proveedor, error: errorProv } = await supabase
        .from('proveedores')
        .update(actualizarProveedor)
        .eq('id_proveedor', id)
        .select()
        .single()
    if (errorProv) throw new Error(errorProv.message)

    return { persona, proveedor }
}

const deleteProveedor = async (id) => {
    const { data: provExistente, error: errorBuscar } = await supabase
        .from('proveedores')
        .select('id_persona')
        .eq('id_proveedor', id)
        .single()
    if (errorBuscar) throw new Error(errorBuscar.message)

    const id_persona = provExistente.id_persona

    const { error: errorProv } = await supabase
        .from('proveedores')
        .delete()
        .eq('id_proveedor', id)
    if (errorProv) throw new Error(errorProv.message)

    const { error: errorPer } = await supabase
        .from('personas')
        .delete()
        .eq('id_persona', id_persona)
    if (errorPer) throw new Error(errorPer.message)

    return { message: 'Proveedor eliminado correctamente' }
}

const getOrdCompraByProveedor = async (id_proveedor) => {
    const { data: ordenes, error } = await supabase
        .from('ordenes_compras')
        .select('id_orden, codigo_orden, fecha, nro_orden, id_estado')
        .eq('id_proveedor', id_proveedor)
        .order('id_orden', { ascending: false })

    if (error) throw new Error(error.message)

    return Promise.all((ordenes || []).map(async (orden) => {
        const { data: estado } = await supabase
            .from('estados')
            .select('nombre')
            .eq('id_estado', orden.id_estado)
            .maybeSingle()

        return {
            id_orden:     orden.id_orden,
            codigo_orden: orden.codigo_orden ?? '—',
            fecha:        orden.fecha ?? '—',
            nro_orden:    orden.nro_orden ?? '—',
            estado:       estado?.nombre ?? '—',
        }
    }))
}


export default { getAllProveedores, getProveedores, searchProveedores, getProveedorByNombre, getProveedorByRuc, postProveedor, updateProveedor, deleteProveedor, getOrdCompraByProveedor }