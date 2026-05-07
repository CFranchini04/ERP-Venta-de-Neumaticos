import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth/auth.routes.js'

const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)

export default app