import xlsx from 'xlsx'
import bcrypt from 'bcryptjs/dist/bcrypt.js'
import db from '../models/index.js'
import { Op, fn, col, where as sequelizeWhere } from 'sequelize'
const { sequelize, Student, Role, User } = db
import * as fs from 'fs'

// Get all students
export async function getStudents(req, res, next) {
  try {
    const { page = 1, limit = 10, gender, status, search } = req.query
    const pageNumber = Math.max(1, parseInt(page) || 1)
    const limitNumber = Math.max(1, parseInt(limit) || 10)
    const offset = (pageNumber - 1) * limitNumber

    const userWhere = {}

    if (gender) userWhere.gender = gender
    if (status) {
      if (status === 'Active') userWhere.active = true
      else if (status === 'Inactive') userWhere.active = false
    }

    if (search) {
      const term = `%${search.toLowerCase()}%`
      userWhere[Op.or] = [
        sequelizeWhere(fn('LOWER', col('user.first_name_en')), {
          [Op.like]: term,
        }),
        sequelizeWhere(fn('LOWER', col('user.first_name_kh')), {
          [Op.like]: term,
        }),
        sequelizeWhere(fn('LOWER', col('user.last_name_en')), {
          [Op.like]: term,
        }),
        sequelizeWhere(fn('LOWER', col('user.last_name_kh')), {
          [Op.like]: term,
        }),
        sequelizeWhere(fn('LOWER', col('user.email')), { [Op.like]: term }),
      ]
    }

    const userInclude = {
      association: 'user',
      attributes: [
        'first_name_en',
        'first_name_kh',
        'last_name_en',
        'last_name_kh',
        'email',
        'gender',
        'active',
      ],
    }
    const hasUserFilter =
      Object.keys(userWhere).length > 0 ||
      Object.getOwnPropertySymbols(userWhere).length > 0

    if (hasUserFilter) {
      userInclude.where = userWhere
    }

    const data = await Student.findAndCountAll({
      include: [userInclude],
      limit: limitNumber,
      offset: offset,
    })

    const formattedData = formatStudentListsData(data.rows)
    return res.status(200).send({ count: data.count, rows: formattedData })
  } catch (err) {
    next(err)
  }
}

// Get a student by ID
export async function getStudentById(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const student = await Student.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: [
            'first_name_en',
            'first_name_kh',
            'last_name_en',
            'last_name_kh',
            'email',
            'gender',
            'active',
            'date_of_birth',
            'phone',
            'profile',
            'address_id',
            'religious',
            'health_status',
          ],
        },
      ],
    })
    if (!student) return res.status(404).send({ message: 'Student not found!' })
    const formattedStudent = formatStudentData(student)
    await transaction.commit()
    return res.status(200).send(formattedStudent)
  } catch (err) {
    await transaction.rollback()
    return res.status(500).send({ message: 'Internal server error!', ...err })
  }
}

// Create a new student
export async function createStudent(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const {
      first_name_en,
      first_name_kh,
      last_name_en,
      last_name_kh,
      email,
      gender,
      date_of_birth,
      phone,
      address_id,
      religious,
      health_status,
      level_id = 1,
      status_id = 1,
      academic_id = 1,
    } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({
      where: {
        email,
      },
    })
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists!' })
    }

    const generatedPassword = 'generatedPassword' // Replace with actual password generation logic
    const hashPassword = await bcrypt.hash(generatedPassword, 10)

    const user = await User.create(
      {
        first_name_en,
        first_name_kh,
        last_name_en,
        last_name_kh,
        email,
        password: hashPassword,
        gender,
        date_of_birth,
        phone,
        address_id: 1,
        religious,
        health_status,
        role_id: 8,
      },
      { transaction }
    )

    await Student.create(
      {
        user_id: user.id,
        level_id,
        status_id,
        academic_id,
        join_date: new Date(),
      },
      { transaction }
    )
    await transaction.commit()
    return res.status(201).send({ message: 'Student created successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Update a student by ID
export async function updateStudent(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const {
      first_name_en,
      first_name_kh,
      last_name_en,
      last_name_kh,
      email,
      gender,
      date_of_birth,
      phone,
      address_id,
      religious,
      health_status,
      level_id = 1,
      status_id = 1,
      academic_id = 1,
    } = req.body
    const student = await Student.findByPk(id)
    if (!student) return res.status(404).send({ message: 'Student not found!' })
    await User.update(
      {
        first_name_en,
        first_name_kh,
        last_name_en,
        last_name_kh,
        email,
        gender,
        date_of_birth,
        phone,
        address_id: 1,
        religious,
        health_status,
      },
      {
        where: {
          id: student.user_id,
        },
        transaction,
      }
    )
    await Student.update(
      {
        level_id,
        status_id,
        academic_id,
      },
      { where: { id: id }, transaction }
    )
    await transaction.commit()
    return res.status(200).send({
      message: 'Student updated successfully!',
    })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Delete a student by ID
export async function deleteStudent(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const student = await Student.findByPk(id)
    if (!student) return res.status(404).send({ message: 'Student not found!' })

    await Student.destroy({
      where: {
        id: id,
      },
      transaction,
    })
    await User.destroy({
      where: {
        id: student.user_id,
      },
      transaction,
    })
    await transaction.commit()
    return res.status(200).send({ message: 'Student deleted successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Delete multiple students
export async function deleteMultipleStudents(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ message: 'Invalid request!' })
    }

    const students = await Student.findAll({
      where: {
        id: ids,
      },
    })
    if (students.length === 0)
      return res.status(404).send({ message: 'No students found!' })

    await Student.destroy({
      where: {
        id: ids,
      },
      transaction,
    })

    await User.destroy({
      where: {
        id: students.map((student) => student.user_id),
      },
      transaction,
    })
    await transaction.commit()
    return res.status(200).send({ message: 'Students deleted successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Import students from excel
export async function importStudents(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const students = xlsx.utils.sheet_to_json(sheet)
    if (students.length === 0) {
      return res.status(400).send({ message: 'No data found in the file!' })
    }

    for (const row of students) {
      const {
        first_name_en,
        first_name_kh,
        last_name_en,
        last_name_kh,
        email,
        gender,
        date_of_birth,
        phone,
        address_id,
        religious,
        health_status,
        level_id = 1,
        status_id = 1,
        academic_id = 1,
      } = row

      const generatedPassword = 'generatedPassword' // Replace this in production
      const hashPassword = await bcrypt.hash(generatedPassword, 10)

      const user = await User.create(
        {
          first_name_en,
          first_name_kh,
          last_name_en,
          last_name_kh,
          email,
          password: hashPassword,
          gender,
          date_of_birth,
          phone,
          address_id,
          religious,
          health_status,
          role_id: 8,
        },
        { transaction }
      )

      await Student.create(
        {
          user_id: user.id,
          level_id,
          status_id,
          academic_id,
          join_date: new Date(),
        },
        { transaction }
      )
    }
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path)
    await transaction.commit()
    return res.status(201).send({ message: 'Students imported successfully!' })
  } catch (err) {
    fs.unlinkSync(req.file.path)
    await transaction.rollback()
    next(err)
  }
}

// Archive a student by ID
export async function archiveAStudent(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const student = await Student.findByPk(id)
    if (!student) return res.status(404).send({ message: 'Student not found!' })

    await User.update(
      { active: false },
      {
        where: {
          id: student.user_id,
        },
        transaction,
      }
    )
    await transaction.commit()
    return res
      .status(200)
      .send({ message: 'Student soft deleted successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Archive multiple students
export async function archiveMultipleStudents(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ message: 'Invalid request!' })
    }

    const students = await Student.findAll({
      where: {
        id: ids,
      },
    })
    if (students.length === 0)
      return res.status(404).send({ message: 'No students found!' })

    await User.update(
      { active: false },
      {
        where: {
          id: students.map((student) => student.user_id),
        },
        transaction,
      }
    )
    await transaction.commit()
    return res
      .status(200)
      .send({ message: 'Students soft deleted successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Export students to excel
export async function exportStudents(req, res, next) {
  try {
    const students = await Student.findAll({
      include: [
        {
          association: 'user',
          attributes: [
            'first_name_en',
            'first_name_kh',
            'last_name_en',
            'last_name_kh',
            'email',
            'gender',
            'active',
            'date_of_birth',
            'phone',
            'profile',
            'address_id',
            'religious',
            'health_status',
          ],
        },
      ],
    })
    if (students.length === 0) {
      return res.status(404).send({ message: 'No students found!' })
    }
    const formattedStudents = formatStudentListsData(students)
    const worksheet = xlsx.utils.json_to_sheet(formattedStudents)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students')
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })
    res.send(excelBuffer)
  } catch (err) {
    next(err)
  }
}
// Export students to excel with specific fields
export async function exportStudentsWithFields(req, res, next) {
  try {
    const { fields } = req.query
    if (!fields) {
      return res
        .status(400)
        .send({ message: 'Fields query parameter is required!' })
    }
    const fieldArray = fields.split(',')
    const students = await Student.findAll({
      include: [
        {
          association: 'user',
          attributes: fieldArray,
        },
      ],
    })
    if (students.length === 0) {
      return res.status(404).send({ message: 'No students found!' })
    }
    const formattedStudents = formatStudentListsData(students)
    const worksheet = xlsx.utils.json_to_sheet(formattedStudents)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students')
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })
    res.send(excelBuffer)
  } catch (err) {
    next(err)
  }
}

// ============================
// INTERNAL HELPER
// ============================

function formatStudentListsData(rows) {
  return rows.map(({ user, ...items }) => {
    const { user: _, ...cleanedItemData } = items.dataValues
    return {
      ...cleanedItemData,
      ...user.dataValues,
    }
  })
}

function formatStudentData(data) {
  const { user, ...item } = data
  const { user: _, ...cleanedItemData } = item.dataValues
  return {
    ...cleanedItemData,
    ...user.dataValues,
  }
}
