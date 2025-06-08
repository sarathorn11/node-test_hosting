import bcrypt from 'bcryptjs/dist/bcrypt.js'
import db from '../models/index.js'
import { Op, fn, col, where as sequelizeWhere } from 'sequelize'
const { Teacher, sequelize, User } = db

// Get all teachers
export async function getTeachers(req, res, next) {
  try {
    const { page = 1, limit = 10, subject, gender, status, search } = req.query;
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);
    const offset = (pageNumber - 1) * limitNumber;

    const teacherWhere = {};
    const userWhere = {};

    if (subject) teacherWhere.major = subject;
    if (gender) userWhere.gender = gender;
    if (status) {
      if (status === 'Active') userWhere.active = true;
      else if (status === 'Inactive') userWhere.active = false;
    }

    if (search) {
      const term = `%${search.toLowerCase()}%`;
      userWhere[Op.or] = [
        sequelizeWhere(fn('LOWER', col('user.first_name_en')), { [Op.like]: term }),
        sequelizeWhere(fn('LOWER', col('user.first_name_kh')), { [Op.like]: term }),
        sequelizeWhere(fn('LOWER', col('user.last_name_en')), { [Op.like]: term }),
        sequelizeWhere(fn('LOWER', col('user.last_name_kh')), { [Op.like]: term }),
        sequelizeWhere(fn('LOWER', col('user.email')), { [Op.like]: term }),
      ];
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
    };

    const hasUserFilter =
      Object.keys(userWhere).length > 0 ||
      Object.getOwnPropertySymbols(userWhere).length > 0;

    if (hasUserFilter) {
      userInclude.where = userWhere;
    }

    const data = await Teacher.findAndCountAll({
      attributes: ['id', 'major', 'join_date', 'id_card'], // 🟢 Include id_card
      where: teacherWhere,
      include: [userInclude],
      limit: limitNumber,
      offset: offset,
    });

    const formattedData = formatTeacherListsData(data.rows);
    return res.status(200).send({ count: data.count, rows: formattedData });
  } catch (err) {
    next(err);
  }
}


// Get teacher by id
export async function getTeacherById(req, res, next) {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id, {
      attributes: ['id', 'major', 'join_date', 'id_card'], // 🟢 Include id_card
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
    });

    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found!' });
    }

    const formatData = formatTeacherData(teacher);
    return res.status(200).send(formatData);
  } catch (err) {
    return res.status(500).send({ message: 'Internal server error!', error: err.message });
  }
}


// Create a new teacher
export async function addTeacher(req, res, next) {
  const transaction = await sequelize.transaction();
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
      role_id,
      major,
      marital_status,
      bio,
      join_date,
      id_card
    } = req.body;

    // Validate id_card format
    // if (id_card && !/^\d{9}$/.test(id_card)) {
    //   throw new Error("id_card must be exactly 9 digits.");
    // }

    // Check if email already exists
    const existingUser = await User.findOne({
      where: { email },
    })
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists!' })
    }

    const generatedPassword = 'generatedPassword'; // Replace with actual password generation logic
    const hashPassword = await bcrypt.hash(generatedPassword, 10);

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
        address_id: address_id || 1, // fallback to 1 if not provided
        religious,
        health_status,
        role_id,
      },
      { transaction }
    );

    await Teacher.create(
      {
        major,
        join_date,
        user_id: user.id,
        marital_status,
        bio,
        id_card
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(201).send({ message: 'success' });
  } catch (err) {
    await transaction.rollback();

    // Show validation or SQL error details for debugging
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: err.message,
        details: err.errors?.map(e => e.message)
      });
    }

    console.error("Teacher creation failed:", err);
    next(err);
  }
}

// Update teacher by id
export async function updateTeacher(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
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
      role_id,
      major,
      marital_status,
      bio,
      join_date,
    } = req.body;

    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      await transaction.rollback();
      return res.status(404).send({ message: 'Teacher not found!' });
    }

    // Update User info
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
        address_id: address_id || 1,
        religious,
        health_status,
        role_id,
      },
      {
        where: { id: teacher.user_id },
        transaction,
      }
    );

    // Update Teacher info
    await Teacher.update(
      {
        major,
        join_date,
        marital_status,
        bio,
      },
      {
        where: { id: id },
        transaction,
      }
    );

    await transaction.commit();
    return res.status(200).send({ message: 'Teacher updated successfully!' });

  } catch (err) {
    await transaction.rollback();

    // Optional: log error for debugging
    console.error("Update failed:", err);

    return res.status(500).send({ message: 'Internal server error', error: err.message });
  }
}


// Delete teacher by id
export async function removeTeacher(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id, { transaction });
    
    if (!teacher) {
      await transaction.rollback();
      return res.status(404).send({ message: 'Teacher not found!' });
    }

    // First delete the teacher record
    await Teacher.destroy({
      where: { id: id },
      transaction
    });

    // Then delete the associated user
    await User.destroy({
      where: { id: teacher.user_id },
      transaction
    });

    await transaction.commit();
    return res.status(200).send({ message: 'Teacher deleted successfully!' });
  } catch (err) {
    await transaction.rollback();
    
    // Handle foreign key constraint errors specifically
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Cannot delete teacher because of existing references',
        error: err.parent.detail
      });
    }

    console.error("Teacher deletion failed:", err);
    next(err);
  }
}

// Delete multiple teachers
export async function removeMultipleTeachers(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { ids } = req.body;
    
    // Fixed syntax - added missing parenthesis
    if (!Array.isArray(ids)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid IDs provided' });
    }

    // Get teachers with their user_ids
    const teachers = await Teacher.findAll({
      where: { id: ids },
      transaction
    });

    if (teachers.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'No teachers found' });
    }

    const userIds = teachers.map(t => t.user_id);

    // Delete teachers first
    await Teacher.destroy({
      where: { id: ids },
      transaction
    });

    // Then delete users
    await User.destroy({
      where: { id: userIds },
      transaction
    });

    await transaction.commit();
    return res.json({ 
      success: true,
      deletedCount: teachers.length
    });
    
  } catch (err) {
    await transaction.rollback();
    
    // Enhanced error handling
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Cannot delete teachers with existing references',
        error: err.parent?.sqlMessage || err.message
      });
    }
    
    console.error('Bulk teacher deletion error:', err);
    next(err);
  }
}
// Do soft delete teacher by id
export async function softDeleteTeacher(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const teacher = await Teacher.findByPk(id)
    if (!teacher) return res.status(404).send({ message: 'Teacher not found!' })

    // Soft delete logic (e.g., set active to false)
    await User.update(
      { active: false },
      { where: { id: teacher.user_id }, transaction }
    )

    await transaction.commit()
    return res
      .status(200)
      .send({ message: 'Teacher soft deleted successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// Soft delete multiple teachers
export async function softDeleteMultipleTeachers(req, res, next) {
  const transaction = await sequelize.transaction()
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ message: 'Invalid request!' })
    }
    const teachers = await Teacher.findAll({
      where: { id: ids },
    })
    if (teachers.length === 0) {
      return res.status(404).send({ message: 'No teachers found!' })
    }

    // Soft delete logic (e.g., set active to false)
    await User.update(
      { active: false },
      {
        where: { id: teachers.map((teacher) => teacher.user_id) },
        transaction,
      }
    )

    await transaction.commit()
    return res
      .status(200)
      .send({ message: 'Teachers soft deleted successfully!' })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

// ============================
// INTERNAL HELPER
// ============================

function formatTeacherListsData(rows) {
  return rows.map(
    ({
      id,
      major,
      join_date,
      user: {
        first_name_en,
        first_name_kh,
        last_name_en,
        last_name_kh,
        email,
        gender,
        active,
      },
    }) => ({
      teacherId: id,
      major,
      joinDate: join_date,
      firstNameEN: first_name_en,
      firstNameKH: first_name_kh,
      lastNameEN: last_name_en,
      lastNameKH: last_name_kh,
      email,
      gender,
      active,
    })
  )
}

function formatTeacherData(data) {
  const { user, ...item } = data
  const { user: _, ...cleanedItemData } = item.dataValues
  return {
    ...cleanedItemData,
    ...user.dataValues,
  }
}
