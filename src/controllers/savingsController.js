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

    // 저금 후 유형에 따른 총 금액 확인
    const afterBalance = await savingsService.getTotalSavingsByType(
      transactionType
    );

    return res
      .status(statusCode.OK)
      .send(
        util.success(
          statusCode.OK,
          responseMessage.SAVINGS_CREATE_SUCCESS,
          afterBalance[0]
        )
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

/**
 * 저금통 확인하기
 */
exports.getAllSavings = async (req, res) => {
  try {
    const result = await savingsService.getAllSavings();

    data = {
      sum: 0,
      saved: 0, // 절약 저금 : 3
      changes: 0, // 잔동 저금 : 4
      coin: 0, // 동전 저금 : 5
    };

    result.forEach((element) => {
      if (element.transactionType == 3) {
        data.saved = parseInt(element.amount);
      } else if (element.transactionType == 4) {
        data.changes = parseInt(element.amount);
      } else if (element.transactionType == 5) {
        data.coin = parseInt(element.amount);
      }
    });

    data.sum = data.saved + data.changes + data.coin;

    return res
      .status(statusCode.OK)
      .send(
        util.success(
          statusCode.OK,
          responseMessage.GET_ALL_SAVINGS_INFO_SUCCESS,
          data
        )
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

/**
 * 월별 절약 저축 금액 확인하기
 */
exports.getMonthlySavedSavings = async (req, res) => {
  try {
    const result = await savingsService.getMonthlySavedSavings();
    return res
      .status(statusCode.OK)
      .send(
        util.success(
          statusCode.OK,
          responseMessage.GET_MONTHLY_SAVED_SAVINGS_SUCCESS,
          result
        )
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
