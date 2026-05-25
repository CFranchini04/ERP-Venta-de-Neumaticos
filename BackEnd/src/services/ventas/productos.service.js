import supabase from '../../config/supabase.js'

const searchProductos = async (search = '') => {
    let query = supabase
        .from('productos')
        .select(`
            id_producto,
            nombre,
            codigo,
            precio_compra,
            precio_venta,
            id_marca,
            id_categoria
        `)

    if (search && search.trim()) {
        query = query.ilike('nombre', `%${search.trim()}%`)
    }

    const { data, error } = await query.limit(10).order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

const getProducto = async (id) => {
    const { data, error } = await supabase
        .from('productos')
        .select(`
            id_producto,
            nombre,
            codigo,
            precio_compra,
            precio_venta,
            id_marca,
            id_categoria
        `)
        .eq('id_producto', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

export default { searchProductos, getProducto }
