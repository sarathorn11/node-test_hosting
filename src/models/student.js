export default (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user', // name of the target model
          key: 'id', // key in the target model
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      level_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'level',
          key: 'id',
        },
      },
      academic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'academic',
          key: 'id',
        },
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'status',
          key: 'id',
        },
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: 'student',
    }
  )
  return Student
}
