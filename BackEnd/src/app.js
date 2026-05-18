import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth/auth.routes.js'
import proveedoresRoutes from './routes/compras/proveedores.routes.js'
import ordenesCompraRoutes from './routes/compras/ordenesCompra.routes.js'
import ordPagoRoutes from './routes/compras/ordenesPago.routes.js'
import pedidosRoutes from './routes/compras/pedidos.routes.js'
import productosRoutes from './routes/misc/productos.routes.js'
import facturasRoutes from './routes/compras/facturas.routes.js'
import cotizacionesRoutes from './routes/compras/cotizaciones.routes.js'

const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/api/compras/proveedores', proveedoresRoutes)
app.use('/api/compras/ordenes-compra', ordenesCompraRoutes)
app.use('/api/compras/ordenes-pago', ordPagoRoutes)
app.use('/api/compras/pedidos', pedidosRoutes)
app.use('/api/misc/productos', productosRoutes)
app.use('/api/compras/facturas', facturasRoutes)
app.use('/api/compras/cotizaciones', cotizacionesRoutes)
export default app