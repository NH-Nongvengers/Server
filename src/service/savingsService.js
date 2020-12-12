const { TransactionDetail } = require('../models');
const userInfo = require('../config/info.json');
const sequelize = require('sequelize');

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
    const result = TransactionDetail.findAll({
      attributes: [
        [
          sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'),
          'period',
        ],
        [sequelize.fn('sum', sequelize.col('amount')), 'amount'],
      ],
      where: {
        account: userInfo.sonAccount,
        transactionType: 3,
      },
      group: 'period',
      order: [[sequelize.col('period'), 'DESC']],
    });
    return result;
  } catch (err) {
    throw err;
  }
};
