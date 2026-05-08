import supabase from '../../config/supabase.js'

const getAllOrdPago = async () => {
    const {data, error} = await supabase
    .from('ordenes_pago')
    .select("*")
    if(error)throw new Error (error.message);
    return data;
}

const getOrdPago = async (id) => {
    const {data, error} = await supabase.from('ordenes_pago')
    .select('*')
    .eq('id_orden_pago',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllOrdPago, getOrdPago}