import supabase from '../../config/supabase.js'

const getAllPresupuestos = async () => {
    const {data, error} = await supabase
    .from('presupuestos')
    .select("*")
    if(error)throw new Error (error.message);
    return data;
}

const getPresupuesto = async (id) => {
    const {data, error} = await supabase.from('presupuestos')
    .select('*')
    .eq('id_presupuesto',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllPresupuestos, getPresupuesto}