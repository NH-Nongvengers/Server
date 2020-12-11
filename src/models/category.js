module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Category',
    {
      categoryIdx: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryName: {
        type: DataTypes.STRING(30),
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
