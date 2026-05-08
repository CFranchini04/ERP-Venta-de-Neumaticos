import supabase from '../../config/supabase.js'

const getAllFacturas = async () => {
    const {data, error} = await supabase
    .from('facturas_ventas')
    .select("*")
    if(error)throw new Error (error.message);
    return data;
}

const getFactura = async (id) => {
    const {data, error} = await supabase.from('facturas_ventas')
    .select('*')
    .eq('id_factura',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllFacturas, getFactura}