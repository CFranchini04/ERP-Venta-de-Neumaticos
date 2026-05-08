import supabase from '../../config/supabase.js'

const getAllOrdCompra = async () => {
    const {data, error} = await supabase
    .from('ordenes_compras')
    .select("*")
    if(error)throw new Error (error.message);
    return data;
}

const getOrdCompra = async (id) => {
    const {data, error} = await supabase.from('ordenes_compras')
    .select('*')
    .eq('id_orden',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllOrdCompra, getOrdCompra}