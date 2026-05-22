import supabase from '../../config/supabase.js'

const getAllEmpleados = async () => {
    const { data, error } = await supabase
        .from('empleados')
        .select('*, personas(*), familiares(count)')
    if (error) throw new Error(error.message)
    return data
}

const getEmpleado = async (id) => {
    const { data, error } = await supabase
        .from('empleados')
        .select('*, personas(*), familiares(count)')
        .eq('id_empleado', id)
    if (error) throw new Error(error.message)
    return data
}

const getEmpleadoByNombre = async (nombre) => {
    const { data, error } = await supabase
        .from('empleados')
        .select('*, personas(*), familiares(count)')
        .ilike('personas.nombre', `%${nombre}%`)
    if (error) throw new Error(error.message)
    return data
}

const getEmpleadoByCi = async (ci) => {
    const { data, error } = await supabase
        .from('empleados')
        .select('*, personas(*), familiares(count)')
        .eq('ci', ci)
    if (error) throw new Error(error.message)
    return data
}

const getEmpleadoByRuc = async (ruc) => {
    const { data, error } = await supabase
        .from('empleados')
        .select('*, personas(*), familiares(count)')
        .eq('personas.ruc', ruc)
    if (error) throw new Error(error.message)
    return data
}

const postEmpleado = async (ci, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento) => {
    const { data: persona, error: errorPer } = await supabase
        .from('personas')
        .insert({ nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento })
        .select()
        .single()
    if (errorPer) throw new Error(errorPer.message)

    const { data: empleado, error: errorEmp } = await supabase
        .from('empleados')
        .insert({ ci, id_persona: persona.id_persona })
        .select()
        .single()
    if (errorEmp) throw new Error(errorEmp.message)
    return empleado
}

const updateEmpleado = async (id, data) => {
    const { ci, ...datosPersona } = data

    const { data: empExistente, error: errorBuscar } = await supabase
        .from('empleados')
        .select('id_persona')
        .eq('id_empleado', id)
        .single()
    if (errorBuscar) throw new Error(errorBuscar.message)

    const id_persona = empExistente.id_persona

    const actualizarPersona = Object.fromEntries(
        Object.entries(datosPersona).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: persona, error: errorPer } = await supabase
        .from('personas')
        .update(actualizarPersona)
        .eq('id_persona', id_persona)
        .select()
        .single()
    if (errorPer) throw new Error(errorPer.message)

    const actualizarEmpleado = Object.fromEntries(
        Object.entries({ ci }).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: empleado, error: errorEmp } = await supabase
        .from('empleados')
        .update(actualizarEmpleado)
        .eq('id_empleado', id)
        .select()
        .single()
    if (errorEmp) throw new Error(errorEmp.message)

    return { persona, empleado }
}

const deleteEmpleado = async (id) => {
    const { data: empExistente, error: errorBuscar } = await supabase
        .from('empleados')
        .select('id_persona')
        .eq('id_empleado', id)
        .single()
    if (errorBuscar) throw new Error(errorBuscar.message)

    const id_persona = empExistente.id_persona

    const { error: errorEmp } = await supabase
        .from('empleados')
        .delete()
        .eq('id_empleado', id)
    if (errorEmp) throw new Error(errorEmp.message)

    const { error: errorPer } = await supabase
        .from('personas')
        .delete()
        .eq('id_persona', id_persona)
    if (errorPer) throw new Error(errorPer.message)

    return { message: 'Empleado eliminado correctamente' }
}

export default { getAllEmpleados, getEmpleado, getEmpleadoByNombre, getEmpleadoByCi, getEmpleadoByRuc, postEmpleado, updateEmpleado, deleteEmpleado }