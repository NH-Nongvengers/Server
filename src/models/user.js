module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'User',
    {
      userIdx: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userName: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
      underscored: true,
    }
  );
};
