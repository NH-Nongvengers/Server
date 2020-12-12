const { TransactionDetail } = require('../models');
const userInfo = require('../config/info.json');

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
