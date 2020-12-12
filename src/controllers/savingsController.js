const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');
const userInfo = require('../config/info.json');
const moment = require('moment');
const { drawTransfer } = require('./drawTransfer'); // 출금이체
const {
  receivedTransferAccountNumber,
} = require('./receivedTransferAccountNumber'); // 농협입금이체

const savingsService = require('../service/savingsService');

/**
 * 저금하기
 */
exports.makeSavings = async (req, res) => {
  const { amount, transactionType } = req.body;

  const description = moment().format('MM월 DD일 저금');
  const categoryIdx = null;

  try {
    /** 출금 */
    // 출금 이체
    await drawTransfer(amount, description);

    // DB에 출금 정보 저장
    await savingsService.createTransaction(
      amount,
      userInfo.motherAccount,
      description,
      1,
      categoryIdx
    );

    /** 저금통에 입금 */
    await receivedTransferAccountNumber(amount, description, description);

    // DB에 입금 정보 저장
    await savingsService.createTransaction(
      amount,
      userInfo.sonAccount,
      description,
      transactionType,
      categoryIdx
    );

    return res
      .status(statusCode.OK)
      .send(
        util.success(statusCode.OK, responseMessage.SAVINGS_CREATE_SUCCESS)
      );
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(
        util.fail(
          statusCode.INTERNAL_SERVER_ERROR,
          responseMessage.INTERNAL_SERVER_ERROR
        )
      );
  }
};
