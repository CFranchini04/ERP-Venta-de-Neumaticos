import express from 'express'
import cors from 'cors'

//AUTH
import authRoutes from './routes/auth/auth.routes.js'

//COMPRAS
import proveedoresRoutes from './routes/compras/proveedores.routes.js'
import ordenesCompraRoutes from './routes/compras/ordenesCompra.routes.js'

import ordPagoRoutes from './routes/compras/ordenesPago.routes.js'
import pedidosRoutes from './routes/compras/pedidos.routes.js'
import facturasRoutes from './routes/compras/facturas.routes.js'
import cotizacionesRoutes from './routes/compras/cotizaciones.routes.js'
import notasCreditoRoutes from './routes/compras/notasCredito.routes.js'
import metodosPagoRouter from './routes/compras/metodosPago.routes.js'

//MISC
import productosRoutes from './routes/misc/productos.routes.js'

//RRHH
import empleadosRoutes from './routes/rrhh/empleados.routes.js'
import salariosRoutes from './routes/rrhh/salarios.routes.js'

//CONTABILIDAD
import cuentasRoutes  from './routes/contabilidad/cuentas.routes.js'
import asientosRoutes from './routes/contabilidad/asientos.routes.js'



//TESORERIA
import movimientosRoutes from './routes/tesoreria/movimientos.routes.js'

//VENTAS
import facturasVentasRoutes from './routes/ventas/facturas.routes.js'
import presupuestosRoutes from './routes/ventas/presupuestos.routes.js'
import notasCreditoVentasRoutes from './routes/ventas/notasCredito.routes.js'

//MIDDLEWARES
import verificarToken from './middlewares/auth.middleware.js'
import soloRol from './middlewares/roles.middleware.js'

const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
//AUTH
app.use('/auth', authRoutes)

//API
app.use('/api/', verificarToken)

//CONTROL POR ROL
app.use('/api/compras/', soloRol('admin', 'compras'))
app.use('/api/ventas/', soloRol('admin', 'ventas'))
app.use('/api/rrhh/', soloRol('admin', 'rrhh'))
app.use('/api/contabilidad/', soloRol('admin', 'contabilidad'))
app.use('/api/tesoreria/', soloRol('admin', 'tesoreria'))

//MISC
app.use('/api/misc/productos', productosRoutes)

//COMPRAS
app.use('/api/compras/proveedores', proveedoresRoutes)
app.use('/api/compras/ordenes-compra', ordenesCompraRoutes)
app.use('/api/compras/ordenes-pago', ordPagoRoutes)
app.use('/api/compras/pedidos', pedidosRoutes)
app.use('/api/compras/facturas', facturasRoutes)
app.use('/api/compras/cotizaciones', cotizacionesRoutes)
app.use('/api/compras/notas-credito', notasCreditoRoutes)
app.use('/api/compras/metodos-pago', metodosPagoRouter)
//RRHH
app.use('/api/rrhh/empleados', empleadosRoutes)
app.use('/api/rrhh/salarios', salariosRoutes)

//CONTABILIDAD
app.use('/api/contabilidad/cuentas',  cuentasRoutes)
app.use('/api/contabilidad/asientos', asientosRoutes)

//TESORERIA
app.use('/api/tesoreria/movimientos', movimientosRoutes)

//VENTAS
app.use('/api/ventas/facturas', facturasVentasRoutes)
app.use('/api/ventas/presupuestos', presupuestosRoutes)
app.use('/api/ventas/notas-credito', notasCreditoVentasRoutes)



export default app