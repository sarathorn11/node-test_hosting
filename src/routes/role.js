import { Router } from 'express'
import { getAllRoles } from '../services/role.js'
import { authorize } from '../middlewares/permission.js'
import { ROLES } from '../constants/role.js'
const roleRoutes = new Router()

// Get all users
roleRoutes.get('/', authorize([ROLES.ADMIN]), getAllRoles)

export default roleRoutes
