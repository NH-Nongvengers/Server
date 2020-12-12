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

exports.getMapping = async (budget, availableBalance, category) => {
  try{
    budget.forEach(item => {
      item.dataValues.budget = parseInt(item.dataValues.budget)
      item.dataValues.balance = 0;
      availableBalance.forEach(element => {
        if(item.dataValues.categoryIdx === element.dataValues.categoryIdx) {
          item.dataValues.balance = item.dataValues.budget - element.dataValues.balance;
        }
      })
      category.forEach(element => {
        if(item.dataValues.categoryIdx === element.dataValues.categoryIdx) {
          item.dataValues.categoryName = element.dataValues.categoryName;
        }
      })
      item.dataValues.percent = item.dataValues.balance === 0 ? 
      0 : item.dataValues.balance < 0 ? 
      Math.floor((-item.dataValues.balance + item.dataValues.budget ) / item.dataValues.budget * 100) 
      : Math.floor(item.dataValues.balance/item.dataValues.budget * 100);
    })
    return budget;
  } catch (err) {
    throw err;
  }
}


exports.getBudgetByCategory = async () => {
  try{
    const budget = await Budget.findAll({
      attributes: ['categoryIdx', [ Sequelize.fn('SUM', Sequelize.col('amount')), 'budget']],
      group: 'categoryIdx'
    });
    return budget;
  } catch (err) {
    throw err;
  }
}

exports.getAvailableBalanceByCategory = async (plan) => {
  try{
    const availableBalance = await TransactionDetail.findAll({
      attributes: ['categoryIdx',[ Sequelize.fn('SUM', Sequelize.col('amount')), 'balance']],
      where : {
        categoryIdx : { [Op.ne]: null },
        createdAt : { [Op.lte]: plan.dataValues.endDate},
        createdAt : { [Op.gte]: plan.dataValues.startDate}
      },
      group: 'categoryIdx',
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
