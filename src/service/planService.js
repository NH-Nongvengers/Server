const moment = require('moment');
const { Op, Sequelize } = require('sequelize');
const userInfo = require('../config/info.json');
const { Plan, Budget, TransactionDetail, Category } = require('../models');

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
        [Op.and]: [{createdAt : { [Op.lte]: plan.dataValues.endDate}}, {createdAt : { [Op.gte]: plan.dataValues.startDate}}],
      }
    });
    return availableBalance;
  } catch (err) {
    throw err;
  }
}
//예산이 0이면 
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
      item.dataValues.percent = (item.dataValues.balance === 0 || item.dataValues.budget ===0 ) ? 0 
      : item.dataValues.balance < 0 ? 
      (Math.floor((-item.dataValues.balance + item.dataValues.budget ) / item.dataValues.budget * 100) === null ? 0 
      :(Math.floor((-item.dataValues.balance + item.dataValues.budget ) / item.dataValues.budget * 100)))
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

/** 플랜 카테고리별 소비 현황 */
exports.getBudgetByCategoryPlan = async (plan) => {
  try{
    const budget = await Budget.findAll({
      where: { planIdx: plan.dataValues.planIdx },
      attributes: ['categoryIdx', [ Sequelize.fn('SUM', Sequelize.col('amount')), 'budget']],
      group: 'categoryIdx'
    });
    return budget;
  } catch (err) {
    throw err;
  }
}

/** 카테고리별 사용 가능한 돈 조회 */
exports.getAvailableBalanceByCategory = async (plan, categoryIdx) => {
  try{
    const where = categoryIdx === undefined ? {
      categoryIdx : { [Op.ne]: null },
      [Op.and]: [{createdAt : { [Op.lte]: plan.dataValues.endDate }}, {createdAt : { [Op.gte]: plan.dataValues.startDate }}],
    } : {
      categoryIdx,
      [Op.and]: [{createdAt : { [Op.lte]: plan.dataValues.endDate }}, {createdAt : { [Op.gte]: plan.dataValues.startDate }}],
    }
    const availableBalance = await TransactionDetail.findAll({
      attributes: ['categoryIdx',[ Sequelize.fn('SUM', Sequelize.col('amount')), 'balance']],
      where,
      group: 'categoryIdx',
    });
    return availableBalance;
  } catch (err) {
    throw err;
  }
}

/** 카테고리별 사용 가능한 돈 조회 */
exports.getOneAvailableBalanceByCategory = async (plan, categoryIdx) => {
  try{
    const availableBalance = await TransactionDetail.findOne({
      attributes: ['categoryIdx',[ Sequelize.fn('SUM', Sequelize.col('amount')), 'balance']],
      where: {
        categoryIdx,
        [Op.and]: [{createdAt : { [Op.lte]: plan.dataValues.endDate }}, {createdAt : { [Op.gte]: plan.dataValues.startDate }}],
      },
      group: 'categoryIdx',
    });
    const category = await Category.findOne({ where : {categoryIdx }})

    if(availableBalance === null) {
      return ({
        categoryIdx,
        balance:0,
        categoryName: category.dataValues.categoryName,
      })
    }
    availableBalance.dataValues.balance = parseInt(availableBalance.dataValues.balance);
    ;
    return { ...availableBalance.dataValues, ...category.dataValues } ;
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
