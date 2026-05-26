import supabase from '../../config/supabase.js'

const getAllClientes = async () => {
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('id_cliente,id_persona,ci')
    .order('id_cliente', { ascending: false })

  if (error) throw new Error(error.message)

  return Promise.all((clientes || []).map(async (cliente) => {
    let nombre = ''
    let apellido = ''
    
    if (cliente.id_persona) {
      const { data: persona, error: personaError } = await supabase
        .from('personas')
        .select('nombre,apellido')
        .eq('id_persona', cliente.id_persona)
        .maybeSingle()
      
      if (!personaError && persona) {
        nombre = persona.nombre || ''
        apellido = persona.apellido || ''
      }
    }

    return {
      id_cliente: cliente.id_cliente,
      id_persona: cliente.id_persona,
      nombre,
      apellido,
      ci: cliente.ci || ''
    }
  }))
}

const getCliente = async (id) => {
  const clienteId = Number(id)
  if (!Number.isInteger(clienteId)) throw new Error('ID de cliente inválido')

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('id_cliente,id_persona,ci')
    .eq('id_cliente', clienteId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!cliente) throw new Error('Cliente no encontrado')

  let nombre = ''
  let apellido = ''
  
  if (cliente.id_persona) {
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('nombre,apellido')
      .eq('id_persona', cliente.id_persona)
      .maybeSingle()
    
    if (!personaError && persona) {
      nombre = persona.nombre || ''
      apellido = persona.apellido || ''
    }
  }

  return {
    id_cliente: cliente.id_cliente,
    id_persona: cliente.id_persona,
    nombre,
    apellido,
    ci: cliente.ci || ''
  }
}

export default {
  getAllClientes,
  getCliente
}
