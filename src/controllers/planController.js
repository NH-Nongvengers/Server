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
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR))
  }
}

exports.expendByCategory = async (req, res) => {
  try {
    const budget = await planService.getBudgetByCategory();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const plan = await planService.getPlanByNow(now);
    const availableBalance = await planService.getAvailableBalanceByCategory(plan);
    const category = await Category.findAll({});
    const result = await planService.getMapping(budget, availableBalance, category);
    res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.GET_EXPENDITURE_BY_CATEGORY_SUCCESS, result));
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
}

exports.getBudgetStatusByMonth = async (req, res) => {
  const planIdx = req.params.plan_idx;
  try {
    const plan = await Plan.findOne({ where : { planIdx }});
    const budget = await planService.getSumOfBudget(planIdx);
    const budgetByCategory = await planService.getBudgetByCategory();
    const availableBalance = await planService.getAvailableBalance(plan);
    const balance = budget[0].dataValues.total - availableBalance[0].dataValues.balance;
    const month = parseInt(moment().format('MM'));
    const availableBalanceByCategory = await planService.getAvailableBalanceByCategory(plan);
    const category = await Category.findAll({});

    const summary = {
      month,
      budget: parseInt(budget[0].dataValues.total),
      amountUsed: parseInt(availableBalance[0].dataValues.balance),
      balance,
    }
    const result = await planService.getMapping(budgetByCategory, availableBalanceByCategory, category);
    const overConsumption = result.filter(it => it.dataValues.balance < 0).map(it => {
      return({
        categoryIdx:it.dataValues.categoryIdx,
        categoryName: it.dataValues.categoryName,
        budget: it.dataValues.budget,
        consumption: it.dataValues.budget - it.dataValues.balance,
        percent: Math.floor((it.dataValues.budget - it.dataValues.balance) / it.dataValues.budget * 100),
      })
    })

    res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.GET_BUDGET_STATUS_BY_MONTH, {summary, overConsumption, result}));
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
}