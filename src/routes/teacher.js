import { Router } from 'express'
import {
  getTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  removeTeacher,
  removeMultipleTeachers,
  softDeleteTeacher,
  softDeleteMultipleTeachers
} from '../services/teacher.js'

const teacherRoutes = new Router()

teacherRoutes.get('/', getTeachers)
teacherRoutes.get('/:id', getTeacherById)
teacherRoutes.post('/', addTeacher)
teacherRoutes.put('/:id', updateTeacher)
teacherRoutes.delete('/:id', removeTeacher)
teacherRoutes.delete('/multiple', removeMultipleTeachers)
teacherRoutes.post('/:id/soft-delete', softDeleteTeacher)
teacherRoutes.post('/soft-delete-multiple', softDeleteMultipleTeachers)

export default teacherRoutes
