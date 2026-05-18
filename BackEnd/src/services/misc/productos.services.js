import supabase from '../../config/supabase.js'

const searchProductos = async (search = '') => {
    let query = supabase
        .from('productos')
        .select(`
            id_producto,
            nombre,
            codigo,
            descripcion,
            precio_compra,
            precio_venta,
            stock_actual,
            stock_minimo,
            marcas(id_marca, nombre),
            categorias_productos(id_categoria, nombre)
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
            descripcion,
            precio_compra,
            precio_venta,
            stock_actual,
            stock_minimo,
            marcas(id_marca, nombre),
            categorias_productos(id_categoria, nombre)
        `)
        .eq('id_producto', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const postProducto = async ({ nombre, codigo, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, id_marca, id_categoria }) => {
    const { data, error } = await supabase
        .from('productos')
        .insert({ nombre, codigo, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, id_marca, id_categoria })
        .select(`
            id_producto,
            nombre,
            codigo,
            descripcion,
            precio_compra,
            precio_venta,
            stock_actual,
            stock_minimo,
            marcas(id_marca, nombre),
            categorias_productos(id_categoria, nombre)
        `)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getAllMarcas = async () => {
    const { data, error } = await supabase
        .from('marcas')
        .select('id_marca, nombre')
        .order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

const getAllCategorias = async () => {
    const { data, error } = await supabase
        .from('categorias_productos')
        .select('id_categoria, nombre')
        .order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

export default { searchProductos, getProducto, postProducto, getAllMarcas, getAllCategorias }