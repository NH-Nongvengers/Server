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
