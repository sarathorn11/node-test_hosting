export default (sequelize, DataTypes) => {
  const StateSchool = sequelize.define(
    'StateSchool',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      timestamps: false,
      tableName: 'state_school',
    }
  )
  return StateSchool
}
