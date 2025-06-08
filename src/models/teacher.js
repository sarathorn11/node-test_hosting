export default (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    'Teacher',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_card: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          is: /^[0-9]{9}$/, // 9 digits
        },
      },
      major: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      marital_status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
      },
    },
    {
      timestamps: false,
      tableName: 'teacher',
    },
  )
  return Teacher
}
