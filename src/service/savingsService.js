const { TransactionDetail, Plan } = require('../models');
const userInfo = require('../config/info.json');
const sequelize = require('sequelize');
const db = require('../models/index');

/**
 * 거래내역 작성
 */
exports.createTransaction = async (
  amount,
  account,
  description,
  type,
  categoryIdx
) => {
  try {
    const transaction = TransactionDetail.create({
      transactionName: description,
      transactionType: type,
      amount,
      account,
      categoryIdx,
    });
    return transaction;
  } catch (err) {
    throw err;
  }
};

/**
 * 저금 후 저금 유형에 따른 총액 조회
 */
exports.getTotalSavingsByType = async (transactionType) => {
  try {
    const result = await TransactionDetail.findAll({
      attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'total']],
      where: {
        account: userInfo.sonAccount,
        transactionType: transactionType,
      },
    });
    return result;
  } catch (err) {
    throw err;
  }
};

/**
 * 저금통 확인하기
 */
exports.getAllSavings = async (req, res) => {
  try {
    const result = await TransactionDetail.findAll({
      attributes: [
        'transactionType',
        [sequelize.fn('sum', sequelize.col('amount')), 'amount'],
      ],
      where: {
        account: userInfo.sonAccount,
        transactionType: { [sequelize.Op.gte]: 3 },
      },
      group: 'transactionType',
    });
    return result;
  } catch (err) {
    throw err;
  }
};

/**
 * 월별 절약 저축 금액 확인하기
 */
exports.getMonthlySavedSavings = async () => {
  try {
    const query = `SELECT plan_idx as planIdx, amount, T.period
    FROM (SELECT plan_idx, date_format(start_date, '%Y-%m') as period FROM Plan) as P join 
    (SELECT sum(amount) as amount, date_format(created_at, '%Y-%m') as period FROM TransactionDetail 
    where account=${userInfo.sonAccount} and  transaction_type=3 group by period) as T 
    ON P.period=T.period ORDER BY T.period DESC;`;

    const result = await db.sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });
    return result;
  } catch (err) {
    throw err;
  }
};

/**
 * 잔돈 모으기 내역 조회하기
 */
exports.getChangesSavingsHistory = async () => {
  try {
    const result = await TransactionDetail.findAll({
      attributes: [
        'transactionName',
        [
          sequelize.fn('date_format', sequelize.col('created_at'), '%m'),
          'month',
        ],
        [
          sequelize.fn('date_format', sequelize.col('created_at'), '%d'),
          'date',
        ],
        [
          sequelize.fn('date_format', sequelize.col('created_at'), '%H:%i'),
          'time',
        ],
        'amount',
        [db.Sequelize.literal('(1000 - mod(amount, 1000))'), 'changes'],
      ],
      where: {
        account: userInfo.motherAccount,
        transactionType: 2,
        [sequelize.Op.and]: [sequelize.literal('MOD(amount, 1000) <> 0')],
      },
      order: [['createdAt', 'DESC']],
    });
    return result;
  } catch (err) {
    throw err;
  }
};
