const moment = require('moment');
const { Op, Sequelize } = require('sequelize');
const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');
const userInfo = require('../config/info.json');
const { Plan, Budget, TransactionDetail } = require('../models');

exports.getBudgetStatus = async (req, res) => {
  try{
    console.log('??')
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    let plan = await Plan.findOne({
      where : {
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      },
    });

    const budget = await Budget.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'total']],
      where : {
        planIdx: plan.dataValues.planIdx
      }
    });

    const availableBalance = await TransactionDetail.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'balance']],
      where : {
        categoryIdx : { [Op.ne]: null },
        createdAt : { [Op.lte]: plan.dataValues.endDate},
        createdAt : { [Op.gte]: plan.dataValues.startDate}
      }
    })
    
    const balance = budget[0].dataValues.total - availableBalance[0].dataValues.balance;
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_PLAN_STATUS_SUCCESS,{
      plan,
      budget: parseInt(budget[0].dataValues.total),
      balance,
    }))
  } catch (err) {
    console.log(err);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_PLAN_STATUS_SUCCESS, plan))
  }
}