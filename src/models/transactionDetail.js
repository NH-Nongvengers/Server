const { Sequelize } = require('.');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'TransactionDetail',
    {
      transactionIdx: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transactionName: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      transactionType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      account: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      categoryIdx: {
        type: DataTypes.INTEGER,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
      underscored: true,
    }
  );
};
