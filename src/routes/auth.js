import { Router } from 'express'
import { login, logout, renewToken } from '../services/auth.js'
const authRoutes = new Router()
authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
authRoutes.post('/refresh-token', renewToken)

export default authRoutes
