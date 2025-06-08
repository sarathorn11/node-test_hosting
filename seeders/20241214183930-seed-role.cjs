module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('role', [
      {
        id: 1,
        name: 'Administrator',
        description: `roles on inputting new students, setting up a calendar and see the student's information… and accessing all parts of the system`,
      },
      {
        id: 2,
        name: 'Executive Director',
        description:
          'Can access all part of the system, but cannot modify the data!',
      },
      {
        id: 3,
        name: 'School Director',
        description: 'Can access all parts of the system!',
      },
      {
        id: 4,
        name: 'Headteachers',
        description: 'can access all parts of the system!',
      },
      {
        id: 5,
        name: 'English Teacher',
        description:
          'can see only their class information and fill the score unit test, conduct, and exam.',
      },
      {
        id: 6,
        name: 'Librarian',
        description:
          ' can see all class information and can only fill scores in library tests.',
      },
      {
        id: 7,
        name: 'Computer Teacher',
        description:
          'can see all class information and can only fill scores in computer tests.',
      },
      {
        id: 8,
        name: 'Student',
        description: 'Access to see their information.',
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role', null, {})
  },
}
