import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import dotenv from 'dotenv'
import { verifyToken } from './middlewares/auth.js'
dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())

app.use('/api', verifyToken, apiRoutes)

export default app
