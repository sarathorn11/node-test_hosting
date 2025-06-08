'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'teacher',
      [
        {
          id_card: '123456789',
          major: 'English',
          join_date: new Date(),
          user_id: 2,
          marital_status: 'Married',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '987654321',
          major: 'English',
          join_date: new Date(),
          user_id: 3,
          marital_status: 'Divorced',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '456789123',
          major: 'English',
          join_date: new Date(),
          user_id: 4,
          marital_status: 'Widowed',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '321654987',
          major: 'English',
          join_date: new Date(),
          user_id: 5,
          marital_status: 'Separated',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '654321789',
          major: 'English',
          join_date: new Date(),
          user_id: 6,
          marital_status: 'Cohabiting',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '789123456',
          major: 'Computer',
          join_date: new Date(),
          user_id: 7,
          marital_status: 'Single',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '159753456',
          major: 'Computer',
          join_date: new Date(),
          user_id: 8,
          marital_status: 'Married',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '753159456',
          major: 'Computer',
          join_date: new Date(),
          user_id: 9,
          marital_status: 'Divorced',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '951753456',
          major: 'Computer',
          join_date: new Date(),
          user_id: 10,
          marital_status: 'Widowed',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '852456963',
          major: 'Computer',
          join_date: new Date(),
          user_id: 11,
          marital_status: 'Separated',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id_card: '456852963',
          major: 'Computer',
          join_date: new Date(),
          user_id: 12,
          marital_status: 'Cohabiting',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('teacher', null, {})
  },
}
