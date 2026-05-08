import supabase from '../../config/supabase.js'

const getAllFacturas = async () => {
    const {data, error} = await supabase
    .from('facturas_compras')
    .select("*")
    if(error)throw new Error (error.message);
    return data;
}

const getFactura = async (id) => {
    const {data, error} = await supabase.from('facturas_compras')
    .select('*')
    .eq('id_factura_compra',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllFacturas, getFactura}