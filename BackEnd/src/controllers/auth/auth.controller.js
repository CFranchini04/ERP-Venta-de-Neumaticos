import authService from '../../services/auth/auth.service.js'

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.status(400).json({ message: 'Email y contraseña requeridos' })

        const { user, session } = await authService.login(email, password)
        res.status(200).json({
            message: 'Login exitoso',
            user,
            token: session.access_token
        })

    } catch (error) {
        res.status(401).json({ message: error.message })
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

export default { login, getRol }