import supabase from '../../config/supabase.js'

const getAllCotizaciones = async (id_pedido) => {
    const {data, error} = await supabase
    .from('cotizaciones_por_pedido')
    .select("*")
    if(error)throw new Error (error.message);
    return data;
}

const getCotizacion = async (id_pedido) => {
    const {data, error} = await supabase.from('cotizaciones_proveedores')
    .select('*')
    .eq('id_pedido',id_pedido)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllCotizaciones, getCotizacion}