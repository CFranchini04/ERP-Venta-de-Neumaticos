// src/middlewares/roles.middleware.js
const soloRol = (...roles) => {
    return (req, res, next) => {
        const rolUsuario = req.user?.user_metadata?.rol

        if (!roles.includes(rolUsuario))
            return res.status(403).json({ message: 'Sin permisos' })

        next()
    }
}

export default soloRol