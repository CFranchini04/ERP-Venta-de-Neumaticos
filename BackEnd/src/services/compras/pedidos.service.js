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

const postPedido = async ({ fecha_creacion, precio_total, id_estado, codigo_pedido }) => {
    const { data, error } = await supabase
        .from('pedidos_compras')
        .insert({ fecha_creacion, precio_total, id_estado, codigo_pedido })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}
 

const postDetallePedido = async (detalles) => {
    const { data, error } = await supabase
        .from('pedidos_compras_detalle')
        .insert(detalles)
        .select()
    if (error) throw new Error(error.message)
    return data
}
export default {getAllPedidos, getPedidos, getTablePedidos, postPedido, postDetallePedido}