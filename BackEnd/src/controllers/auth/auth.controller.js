import authService from '../../services/auth/auth.service.js'

// auth.controller.js
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ message: 'Email y contraseña requeridos' })

        const { user, session } = await authService.login(email, password)
        res.status(200).json({
            message: 'Login exitoso',
            user,
            token: session.access_token,
            refresh_token: session.refresh_token // ← agregá esto
        })
    } catch (error) {
        res.status(401).json({ message: error.message })
    }
}

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await authService.getUsuarios()
        res.status(200).json(usuarios)
    } catch (error) {
        console.error('Error getUsuarios:', error) // ← agregá esto
        res.status(500).json({ message: error.message })
    }
}

const updatePermisos = async (req, res) => {
    try {
        const { id } = req.params
        const { rutas } = req.body
        if (!Array.isArray(rutas)) return res.status(400).json({ message: 'rutas debe ser un array' })
        await authService.updatePermisos(id, rutas)
        res.status(200).json({ message: 'Permisos actualizados' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params
        await authService.deleteUsuario(id)
        res.status(200).json({ message: 'Usuario eliminado' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const createUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rutas } = req.body
        if (!nombre || !email || !password) return res.status(400).json({ message: 'Faltan campos obligatorios' })
        const usuario = await authService.createUsuario(email, password, nombre, rutas ?? [])
        res.status(201).json(usuario)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getRol = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) return res.status(400).json({ message: 'Token requerido' })

        const rol = await authService.getRol(token)
        res.status(200).json({
            message: 'Usuario encontrado',
            rol
        })

    } catch (error) {
        res.status(401).json({ message: error.message })
    }
}

const refresh = async (req, res) => {
    try {
        const { refresh_token } = req.body
        if (!refresh_token) return res.status(400).json({ message: 'Refresh token requerido' })
        const tokens = await authService.refresh(refresh_token)
        res.status(200).json(tokens)
    } catch (error) {
        res.status(401).json({ message: error.message })
    }
}

export default { login, getRol, refresh, getUsuarios, updatePermisos, deleteUsuario, createUsuario }
