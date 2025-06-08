export default (sequelize, DataTypes) => {
  const SchoolHistory = sequelize.define(
    'SchoolHistory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      timestamps: false,
      tableName: 'school_history',
    }
  )
  return SchoolHistory
}
