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

export default { getAllProveedores, getProveedores, postProveedor, updateProveedor, deleteProveedor }