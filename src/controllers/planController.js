const moment = require('moment');
const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');
const userInfo = require('../config/info.json');
const planService = require('../service/planService');

exports.getBudgetStatus = async (req, res) => {
  try{
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const plan = await planService.getPlanByNow(now);
    const budget = await planService.getSumOfBudget(plan.dataValues.planIdx);
    const availableBalance = await planService.getAvailableBalance(plan);
    const balance = budget[0].dataValues.total - availableBalance[0].dataValues.balance;
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_PLAN_STATUS_SUCCESS,{
      plan,
      budget: parseInt(budget[0].dataValues.total),
      balance,
    }))
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.success(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR))
  }
}


exports.expendByCategory = async (req, res) => {/*
  try {
    const budget = await Budget.findAll({
      attributes: ['categoryIdx',[Sequelize.fn('SUM', Sequelize.col('amount')), 'sum']],
      group: 'categoryIdx',
    });
    res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.GET_EXPENDITURE_BY_CATEGORY_SUCCESS, budget))
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.success(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR))
  }*/
}
