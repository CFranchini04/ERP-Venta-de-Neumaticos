import supabase from '../../config/supabase.js'

const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })
    if (error) throw new Error(error.message)
    return data
}

const getRol = async (token) => {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw new Error(error.message)
    if (!user) throw new Error('Usuario no encontrado')
    return user.user_metadata.rol
}

const getUsuarios = async () => {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) throw new Error(error.message)
    return data.users.map(u => ({
        id: u.id,
        email: u.email,
        nombre: u.user_metadata?.nombre || u.user_metadata?.full_name || u.email,
        rol: u.user_metadata?.rol || 'sin rol',
        rutas: u.user_metadata?.rutas ?? [],
    }))
}

const updatePermisos = async (id, rutas) => {
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
        user_metadata: { rutas }
    })
    if (error) throw new Error(error.message)
    return data.user
}

const deleteUsuario = async (id) => {
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) throw new Error(error.message)
}

const createUsuario = async (email, password, nombre, rutas) => {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { nombre, rutas, rol: 'sin rol' },
        email_confirm: true,
    })
    if (error) throw new Error(error.message)
    return { id: data.user.id, email: data.user.email, nombre, rol: 'sin rol', rutas }
}

const refresh = async (refresh_token) => {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token })
    if (error) throw new Error(error.message)
    return {
        token: data.session.access_token,
        refresh_token: data.session.refresh_token
    }
}

export default { login, getRol, refresh, getUsuarios, updatePermisos, deleteUsuario, createUsuario }
