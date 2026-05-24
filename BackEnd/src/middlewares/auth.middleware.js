// src/middlewares/auth.middleware.js
import supabase from '../config/supabase.js'

const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token)
            return res.status(401).json({ message: 'Token requerido' })

        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (error || !user)
            return res.status(401).json({ message: 'Token inválido' })

        req.user = user // ← guardás el user para usarlo en el controller
        next()          // ← dejás pasar
    } catch (error) {
        res.status(401).json({ message: error.message })
    }
}

export default verificarToken