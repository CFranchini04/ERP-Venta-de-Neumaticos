import supabase from '../../config/supabase.js'
const SELECT_ALL = `*, personas(*), personas_horario_cargo(*,cargo(*), estados(*)))`
const SELECT_SINGLE = `*, personas(*), personas_horario_cargo(*,cargo(*), estados(nombre)))`

const getAllEmpleados = async () => {
    const { data, error } = await supabase
        .from('empleados')
        .select(SELECT_ALL)
    if (error) throw new Error(error.message)
    return data
}

const getTableEmpleado = async () => {
    const { data, error } = await supabase.
        from('empleados')
        .select('id_empleado,ci, personas(nombre,apellido), personas_horario_cargo(fecha_inicio ,cargo(nombre))')
    if (error) throw new Error(error.message)
    return data
}

const getEmpleado = async (id) => {
    const { data, error } = await supabase
        .from('empleados')
        .select(SELECT_SINGLE)
        .eq('id_empleado', id)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getEmpleadoByNombre = async (nombre) => {
    const { data, error } = await supabase
        .from('empleados')
        .select(SELECT_SINGLE)
        .ilike('personas.nombre', `%${nombre}%`)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getEmpleadoByCi = async (ci) => {
    const { data, error } = await supabase
        .from('empleados')
        .select(SELECT_SINGLE)
        .eq('ci', ci)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const getEmpleadoByRuc = async (ruc) => {
    const { data, error } = await supabase
        .from('empleados')
        .select(SELECT_SINGLE)
        .eq('personas.ruc', ruc)
        .single()
    if (error) throw new Error(error.message)
    return data
}

const postEmpleado = async (ci, conyugue, nro_hijos, hijos_menores, nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento, id_cargo, id_estado, fecha_inicio) => {

    const { data: persona, error: errorPer } = await supabase
        .from('personas')
        .insert({ nombre, apellido, ruc, direccion, telefono, correo, tipo_persona, fecha_nacimiento })
        .select()
        .single()
    if (errorPer) throw new Error(errorPer.message)


    const { data: empleado, error: errorEmp } = await supabase
        .from('empleados')
        .insert({ ci, conyugue, nro_hijos, hijos_menores, id_persona: persona.id_persona })
        .select()
        .single()
    if (errorEmp) throw new Error(errorEmp.message)

    const { data: phc, error: errorPhc } = await supabase
        .from('personas_horario_cargo')
        .insert({ id_empleado: empleado.id_empleado, id_cargo, id_estado, fecha_inicio })
        .select()
        .single()
    if (errorPhc) throw new Error(errorPhc.message)

    return { persona, empleado, phc }
}

const updateEmpleado = async (id, data) => {
    const { ci, conyugue, nro_hijos, hijos_menores, fecha_inicio, id_cargo, id_estado, ...datosPersona } = data

    const { data: empExistente, error: errorBuscar } = await supabase
        .from('empleados')
        .select('id_persona')
        .eq('id_empleado', id)
        .single()
    if (errorBuscar) throw new Error(errorBuscar.message)

    const { data: phcExistente, error: errorBuscarPhc } = await supabase
        .from('personas_horario_cargo')
        .select('id_phc')
        .eq('id_empleado', id)
        .single()
    if (errorBuscarPhc) throw new Error(errorBuscarPhc.message)

    const id_persona = empExistente.id_persona
    const id_phc = phcExistente.id_phc

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
        Object.entries({ ci, conyugue, nro_hijos, hijos_menores }).filter(([_, v]) => v !== undefined)
    )
    const { data: empleado, error: errorEmp } = await supabase
        .from('empleados')
        .update(actualizarEmpleado)
        .eq('id_empleado', id)
        .select()
        .single()
    if (errorEmp) throw new Error(errorEmp.message)

    const actualizarPhc = Object.fromEntries(
        Object.entries({ fecha_inicio, id_cargo, id_estado }).filter(([_, v]) => v !== undefined && v !== '')
    )
    const { data: phc, error: errorPhc } = await supabase
        .from('personas_horario_cargo')
        .update(actualizarPhc)
        .eq('id_phc', id_phc)
        .select()
        .single()
    if (errorPhc) throw new Error(errorPhc.message)

    return { persona, empleado, phc }
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

const getAllCargos = async () => {
    const { data, error } = await supabase
        .from('cargo')
        .select('*')
        .order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

const postCargo = async (nombre, jefe_inmediato, area_superior, salario) => {
    const {data, error} = await supabase
    .from('cargo')
    .insert({nombre, jefe_inmediato, area_superior, salario})
    .select().single()
    if (error) throw new Error( error.message)
    return data
}

export default { getAllEmpleados, getTableEmpleado, getEmpleado, getEmpleadoByNombre, getEmpleadoByCi, getEmpleadoByRuc, postEmpleado, updateEmpleado, deleteEmpleado, getAllCargos, postCargo }