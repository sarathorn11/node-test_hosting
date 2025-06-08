import { Router } from 'express'
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  deleteMultipleStudents,
  importStudents,
  archiveAStudent,
  archiveMultipleStudents,
  exportStudents,
  exportStudentsWithFields,
} from '../services/student.js'
import multer from 'multer'
import * as fs from 'fs'
const TMP = 'tmp'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(TMP, { recursive: true })
    cb(null, TMP)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

const studentRoutes = new Router()

// Get all students
studentRoutes.get('/', getStudents)

// Get a student by ID
studentRoutes.get('/:id', getStudentById)

// Create a new student
studentRoutes.post('/', createStudent)

// Update a student by ID
studentRoutes.put('/:id', updateStudent)

// Delete a student by ID
studentRoutes.delete('/:id', deleteStudent)

// Delete multiple students by IDs
studentRoutes.delete('/', deleteMultipleStudents)
// Import students from a file
studentRoutes.post('/import', upload.single('file'), importStudents)
// Archive a student by ID
studentRoutes.post('/archive/:id', archiveAStudent)
// Archive multiple students by IDs
studentRoutes.post('/archive', archiveMultipleStudents)
// Export all students
studentRoutes.get('/exports/xlsx', exportStudents)
// Export students with specific fields
studentRoutes.get('/exports/xlsx/fields', exportStudentsWithFields)

export default studentRoutes
