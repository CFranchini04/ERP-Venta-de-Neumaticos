import supabase from '../../config/supabase.js'
const SELECT_FULL = `
            *,
            inventarios(*),
            marcas(*),
            categorias_productos(*)
        `

const SELECT_SINGLE = `
            id_producto,
            nombre,
            codigo,
            descripcion,
            precio_compra,
            precio_venta,
            inventarios(cantidad, stock_minimo, stock_maximo),
            marcas(nombre),
            categorias_productos(id_categoria, nombre)
        `

const searchProductos = async (search = '') => {
    let query = supabase
        .from('productos')
        .select(SELECT_FULL)

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
        .select(SELECT_SINGLE)
        .eq('id_producto', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const postProducto = async ({ nombre, codigo, descripcion, precio_compra, precio_venta, stock_minimo, stock_maximo, id_marca, id_categoria }) => {
    const { data: producto, error } = await supabase
        .from('productos')
        .insert({ nombre, codigo, descripcion, precio_compra, precio_venta, id_marca, id_categoria })
        .select(SELECT_SINGLE)
        .single()
    if (error) throw new Error(error.message)
    const id_producto = producto.id_producto;
    const id_deposito = 1;
    const { data: dataStock, error: errorStock } = await supabase
        .from('inventarios')
        .insert({ id_deposito, id_producto, stock_minimo, stock_maximo})
        .select()
        .single()
    if(errorStock) throw new Error(errorStock.message)
    return {producto, stock: dataStock}
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