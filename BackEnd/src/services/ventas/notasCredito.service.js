import supabase from '../../config/supabase.js'

const SELECT_FULL = ` *, detalles_notas_credito_ventas(*, productos(*))`
const SELECT_SINGLE = ` `
const getAllNC = async () => {
    const {data, error} = await supabase
    .from('notas_credito_ventas')
    .select(SELECT_FULL)
    if(error)throw new Error (error.message);
    return data;
}

const getNC = async (id) => {
    const {data, error} = await supabase.from('notas_credito_ventas')
    .select('*')
    .eq('id_nota_credito_venta',id)
    if(error) throw new Error(error.message);
    return data
}

export default {getAllNC, getNC}