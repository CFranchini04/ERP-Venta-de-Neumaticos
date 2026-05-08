import supabase from '../../config/supabase.js'

const getAllProveedores = async () => {
    const {data, error} = await supabase
    .from('proveedores')
    .select("*, personas(*)")
    if(error)throw new Error (error.message);
    return data;
}

const getProveedores = async (id) => {
    const {data, error} = await supabase.from('proveedores')
    .select('*, personas(*)')
    .eq('id_proveedor',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllProveedores, getProveedores}