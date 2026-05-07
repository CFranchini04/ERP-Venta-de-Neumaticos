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

export default { login, getRol }