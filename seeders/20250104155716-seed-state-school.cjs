'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'state_school',
      [
        { id: 1 /* other fields */ },
        { id: 2 /* other fields */ },
        { id: 3 /* other fields */ },
        { id: 4 /* other fields */ },
        { id: 5 /* other fields */ },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('state_school', null, {})
  },
}
