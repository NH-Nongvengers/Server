const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Plan = require('./plan')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.TransactionDetail = require('./transactionDetail')(sequelize, Sequelize);
db.Budget = require('./budget')(sequelize, Sequelize);

/* 1 : N   User : Plan */
db.User.hasMany(db.Plan, {
  onDelete: 'cascade',
  foreignKey: 'userIdx',
  sourceKey: 'userIdx',
});
db.Plan.belongsTo(db.User, { foreignKey: 'userIdx', targetKey: 'userIdx' });

/* 1 : N   Category : TransactionDetail */
db.Category.hasMany(db.TransactionDetail, {
  onDelete: 'cascade',
  foreignKey: 'categoryIdx',
  sourceKey: 'categoryIdx',
});
db.TransactionDetail.belongsTo(db.Category, {
  foreignKey: 'categoryIdx',
  targetKey: 'categoryIdx',
});

/* M : N   Category : Plan  => Budget */
db.Category.belongsToMany(db.Plan, {
  through: 'Budget',
  as: 'SPlitByBudget',
  foreignKey: 'categoryIdx',
});
db.Plan.belongsToMany(db.Category, {
  through: 'Budget',
  as: 'MakeBudget',
  foreignKey: 'planIdx',
});

module.exports = db;
