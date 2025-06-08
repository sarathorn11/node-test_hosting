import { Router } from 'express'
import userRoutes from './user.js'
import roleRoutes from './role.js'
import authRoutes from './auth.js'
import studentRoutes from './student.js'
import teacherRoutes from './teacher.js'
const apiRouter = Router()

apiRouter.use('/user', userRoutes)
apiRouter.use('/role', roleRoutes)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/students', studentRoutes)
apiRouter.use('/teachers', teacherRoutes)
export default apiRouter
