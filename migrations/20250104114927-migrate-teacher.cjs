'use strict'

const { ENUM } = require('sequelize')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_card: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          is: /^[0-9]{9}$/, // 9 digits
        },
      },
      major: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      join_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      marital_status: {
        type: ENUM(
          'Single',
          'Married',
          'Divorced',
          'Widowed',
          'Separated',
          'Cohabiting'
        ),
        allowNull: true,
      },
      bio: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teacher')
  },
}
