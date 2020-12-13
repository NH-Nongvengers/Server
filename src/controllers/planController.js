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
    const budgetByCategory = await planService.getBudgetByCategoryPlan(plan);
    const availableBalance = await planService.getAvailableBalance(plan);
    const balance = budget[0].dataValues.total - availableBalance[0].dataValues.balance;
    const month = parseInt(moment(plan.dataValues.startDate).format('MM'));
    const availableBalanceByCategory = await planService.getAvailableBalanceByCategory(plan);
    const category = await Category.findAll({});

    const summary = {
      month,
      budget: parseInt(budget[0].dataValues.total),
      amountUsed: parseInt(availableBalance[0].dataValues.balance),
      balance,
    }
    const result = await planService.getMapping(budgetByCategory, availableBalanceByCategory, category);
    const overConsumption = result
      .filter(it => it.dataValues.balance < 0)
      .map(it => {
        return({
          categoryIdx:it.dataValues.categoryIdx,
          categoryName: it.dataValues.categoryName,
          budget: it.dataValues.budget,
          consumption: it.dataValues.budget - it.dataValues.balance,
          percent: it.dataValues.budget === 0 ? 0 
          : Math.floor((it.dataValues.budget - it.dataValues.balance) / it.dataValues.budget * 100),
        })
      });

    res.status(statusCode.OK).send(util.success(statusCode.OK,responseMessage.GET_BUDGET_STATUS_BY_MONTH, {summary, overConsumption, result}));
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
}

/** 월, 카테고리별 소비 상세 내역 */
exports.getConsumptionDetail = async (req, res) => {
  const { plan_idx: planIdx, idx: categoryIdx } = req.params;
  try {
    const plan = await Plan.findOne({ where : { planIdx }});
    const month = parseInt(moment(plan.dataValues.startDate).format('MM'));
    const amountOfCategory = await planService.getOneAvailableBalanceByCategory(plan, parseInt(categoryIdx));
    let detailAmount = await TransactionDetail.findAll({
      attributes: ['transactionName', 'createdAt', 'amount'],
      where: {
        [Op.and]: [{createdAt : { [Op.lte]: plan.dataValues.endDate}}, {createdAt : { [Op.gte]: plan.dataValues.startDate}}],
        transactionType: 2, //지출만
        categoryIdx,
      },
      order: [['createdAt', 'DESC']],
    })
    detailAmount = detailAmount === null ? [] : detailAmount;
    detailAmount.map(item => {
      item.dataValues.date = parseInt(moment(item.dataValues.createdAt).format('DD'));
      item.dataValues.time = moment(item.dataValues.createdAt).format('HH:mm');
      delete item.dataValues.createdAt;
    });

    const resultMap = new Map();

    detailAmount.forEach(item => {
      if(resultMap.has(item.dataValues.date)){
        resultMap.get(item.dataValues.date)[item.dataValues.date].push({
          transactionName: item.dataValues.transactionName,
          amount: item.dataValues.amount,
          time: item.dataValues.time,
        })
      } else {
        resultMap.set(item.dataValues.date, {
          [item.dataValues.date]: [{
            transactionName: item.dataValues.transactionName,
            amount: item.dataValues.amount,
            time: item.dataValues.time,
          }],
        })
      }
    })

    const transactionDetails = {};
    for (let [key, value] of resultMap.entries()){
      transactionDetails["d"+key] = resultMap.get(key)[key];
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_DETAIL_CONSUMPTION_SUCCESS, {month, amountOfCategory, transactionDetails}));
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
}

/**
 * 
 */
exports.getBudgetChange =  async (req, res) => {
  const dto = {};
  const planIdx = 1;
  try {
    const plan = await Plan.findOne({
      attributes: ['startDate'],
      where : { planIdx }
    });

    const plans = await Plan.findAll({
      attributes: ['planIdx'],
      where : {
        startDate: { [Op.lte]: plan.dataValues.startDate }
      },
      order : [['startDate', 'DESC']],
      limit : 3,
      offset: 1
    });

    const sumBudget = await Budget.findOne({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('total')), 'sumTotal'],[Sequelize.fn('SUM', Sequelize.col('amount')), 'sumBudget']],
      where: {
        planIdx: plans.map(it => it.dataValues.planIdx),
      },
    })

    dto.averageBudget = parseInt(sumBudget.dataValues.sumBudget / 3);
    dto.averageTotal = parseInt(sumBudget.dataValues.sumTotal / 3);

    //카테고리별 평균 예산
    const sumBudgetCategory = await Budget.findAll({
      attributes: ['categoryIdx',[Sequelize.fn('SUM', Sequelize.col('amount')), 'sumBudget']],
      where: {
        planIdx: plans.map(it => it.dataValues.planIdx),
      },
      group: 'categoryIdx'
    });

    const category = await Category.findAll({
      where : {
        categoryIdx: sumBudgetCategory.map(it => it.dataValues.categoryIdx),
      }
    })

    sumBudgetCategory.map(item => {
      item.dataValues.categoryAverageBudget = parseInt(item.dataValues.sumBudget/3);
      delete item.dataValues.sumBudget;
      category.forEach(element => {
        if(item.dataValues.categoryIdx === element.dataValues.categoryIdx) {
          item.dataValues.categoryName = element.dataValues.categoryName;
        }
      })
    });

    dto.sumBudgetCategory = sumBudgetCategory

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_BUDGET_SUCCESS, dto));
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
}

exports.updateBudget = async (req, res) => {
  const planIdx = 1;
  try {
    const data = Object.entries(req.body);
    for(let i in data) {
      await Budget.update({
        amount: data[i][1]
      },{
        where: { 
          planIdx,
          categoryIdx: (parseInt(i) + 1)
        }
      })
    }
   res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_BUDGET_SUCCESS, []));
  } catch (err) {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
}