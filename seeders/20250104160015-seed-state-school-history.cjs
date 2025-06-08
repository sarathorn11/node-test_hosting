'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'state_school_history',
      [
        {
          id: 1,
          // Add other fields as necessary
        },
        {
          id: 2,
          // Add other fields as necessary
        },
        {
          id: 3,
          // Add other fields as necessary
        },
        {
          id: 4,
          // Add other fields as necessary
        },
        {
          id: 5,
          // Add other fields as necessary
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('state_school_history', null, {})
  },
}
