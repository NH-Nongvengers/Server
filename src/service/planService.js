const moment = require('moment');
const { Op, Sequelize } = require('sequelize');
const userInfo = require('../config/info.json');
const { Plan, Budget, TransactionDetail } = require('../models');

exports.getPlanByNow = async (date) => {
  try{
    const plan = await Plan.findOne({
      where : {
        startDate: { [Op.lte]: date },
        endDate: { [Op.gte]: date }
      },
    });
    return plan;
  } catch (err) {
    throw err;
  }
}

exports.getSumOfBudget = async (planIdx) => {
  try{
    const budget = await Budget.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'total']],
      where : {
        planIdx,
      }
    });
    return budget;
  } catch (err) {
    throw err;
  }
}

exports.getAvailableBalance = async (plan) => {
  try{
    const availableBalance = await TransactionDetail.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'balance']],
      where : {
        categoryIdx : { [Op.ne]: null },
        createdAt : { [Op.lte]: plan.dataValues.endDate},
        createdAt : { [Op.gte]: plan.dataValues.startDate}
      }
    });
    return availableBalance;
  } catch (err) {
    throw err;
  }
}

exports.example = async () => {
  try{

  } catch (err) {
    throw err;
  }
}

