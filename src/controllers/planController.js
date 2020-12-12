const moment = require('moment');
const _ = require('lodash');
const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');
const userInfo = require('../config/info.json');
const planService = require('../service/planService');
const { Plan, Budget, Category, TransactionDetail } = require('../models');
const { Op, Sequelize } = require('sequelize');


exports.getBudgetStatus = async (req, res) => {
  try{
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const plan = await planService.getPlanByNow(now);
    const budget = await planService.getSumOfBudget(plan.dataValues.planIdx);
    const availableBalance = await planService.getAvailableBalance(plan);
    const balance = budget[0].dataValues.total - availableBalance[0].dataValues.balance;
    const day = parseInt(moment(plan.dataValues.endDate, "YYYYMMDD").fromNow().split(" ")[1]) - 1;
    const month = parseInt(moment().format('MM'));
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_PLAN_STATUS_SUCCESS,{
      month,
      dDay: day,
      budget: parseInt(budget[0].dataValues.total),
      amountUsed: parseInt(availableBalance[0].dataValues.balance),
      balance,
    }))
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.success(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR))
  }
}

exports.expendByCategory = async (req, res) => {
  try {
    let budget = await Budget.findAll({
      attributes: ['categoryIdx', [ Sequelize.fn('SUM', Sequelize.col('amount')), 'budget']],
      group: 'categoryIdx'
    });
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const plan = await planService.getPlanByNow(now);
    const availableBalance = await TransactionDetail.findAll({
      attributes: ['categoryIdx',[ Sequelize.fn('SUM', Sequelize.col('amount')), 'balance']],
      where : {
        categoryIdx : { [Op.ne]: null },
        createdAt : { [Op.lte]: plan.dataValues.endDate},
        createdAt : { [Op.gte]: plan.dataValues.startDate}
      },
      group: 'categoryIdx',
    });

    const category = await Category.findAll({});
    
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
      (-item.dataValues.balance + item.dataValues.budget ) / item.dataValues.budget * 100 
      : item.dataValues.balance/item.dataValues.budget * 100;
    })

    res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.GET_EXPENDITURE_BY_CATEGORY_SUCCESS, budget))
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.success(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR))
  }
}