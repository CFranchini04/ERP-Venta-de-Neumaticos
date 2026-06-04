import supabase from '../../config/supabase.js'

const getAllMetodosPago = async () => {
    const { data, error } = await supabase
        .from('metodos_de_pago')
        .select('*')
        .order('id_metodo_de_pago', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

const getMetodoPago = async (id) => {
    const { data, error } = await supabase
        .from('metodos_de_pago')
        .select('*')
        .eq('id_metodo_de_pago', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const createMetodoPago = async (nombre) => {
    if (!nombre?.trim()) throw new Error('El nombre es obligatorio')
    const { data, error } = await supabase
        .from('metodos_de_pago')
        .insert({ nombre: nombre.trim() })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const updateMetodoPago = async (id, nombre) => {
    if (!nombre?.trim()) throw new Error('El nombre es obligatorio')
    const { data, error } = await supabase
        .from('metodos_de_pago')
        .update({ nombre: nombre.trim() })
        .eq('id_metodo_de_pago', id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

const deleteMetodoPago = async (id) => {
    // Verificar que no esté en uso en ningún detalle de orden de pago
    const { data: enUso, error: errorUso } = await supabase
        .from('detalles_orden_pago')
        .select('id_d_orden_pago')
        .eq('id_metodo_pago', id)
        .limit(1)
    if (errorUso) throw new Error(errorUso.message)
    if (enUso && enUso.length > 0)
        throw new Error('No se puede eliminar: el método de pago está en uso en una o más órdenes de pago')

    const { error } = await supabase
        .from('metodos_de_pago')
        .delete()
        .eq('id_metodo_de_pago', id)
    if (error) throw new Error(error.message)
    return { message: 'Método de pago eliminado correctamente' }
}

export default { getAllMetodosPago, getMetodoPago, createMetodoPago, updateMetodoPago, deleteMetodoPago }