export default (sequelize, DataTypes) => {
  const StateSchoolHistory = sequelize.define(
    'StateSchoolHistory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      timestamps: false,
      tableName: 'state_school_history',
    }
  )
  return StateSchoolHistory
}
