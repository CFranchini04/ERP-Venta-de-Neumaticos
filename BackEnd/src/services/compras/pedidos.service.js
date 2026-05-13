import { get } from 'node:http';
import supabase from '../../config/supabase.js'

const getAllPedidos = async () => {
    const {data, error} = await supabase
    .from('pedidos_compras')
    .select('*')
    if(error)throw new Error (error.message);
    return data;
}

const getPedidos = async (id) => {
    const {data, error} = await supabase.from('pedidos_compras')
    .select('*')
    .eq('id_pedido',id)
    if(error) throw new Error(error.message);
    return data
}

const getTablePedidos = async () => {
    const {data, error} = await supabase
    .from('pedidos_compras')
    .select('codigo_pedido, fecha_creacion, estados(nombre)')
    if(error)throw new Error (error.message);
    return data;
}
export default {getAllPedidos, getPedidos, getTablePedidos}