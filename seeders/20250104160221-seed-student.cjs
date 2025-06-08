'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'student',
      [
        {
          id: 1,
          user_id: 13,
          level_id: 1,
          academic_id: 1,
          status_id: 1,
          join_date: new Date(),
        },
        {
          id: 2,
          user_id: 14,
          level_id: 2,
          academic_id: 2,
          status_id: 2,
          join_date: new Date(),
        },
        {
          id: 3,
          user_id: 15,
          level_id: 2,
          academic_id: 2,
          status_id: 2,
          join_date: new Date(),
        },
        {
          id: 4,
          user_id: 16,
          level_id: 2,
          academic_id: 2,
          status_id: 2,
          join_date: new Date(),
        },
        {
          id: 5,
          user_id: 17,
          level_id: 2,
          academic_id: 2,
          status_id: 2,
          join_date: new Date(),
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('student', null, {})
  },
}
