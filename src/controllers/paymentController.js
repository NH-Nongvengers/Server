const responseMessage = require('../modules/responseMessage');
const statusCode = require('../modules/statusCode');
const util = require('../modules/util');
const userInfo = require('../config/info.json');
const { drawTransfer } = require('./drawTransfer'); // 출금이체
const {
  receivedTransferAccountNumber,
} = require('./receivedTransferAccountNumber'); // 농협입금이체
const savingsService = require('../service/savingsService');
const paymentService = require('../service/paymentService');

exports.createPayment = async (req, res) => {
  const { amount, description, categoryIdx } = req.body;
  try {
    if (!amount || !description || !categoryIdx) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    /** 결제 */
    // 출금 이체
    await drawTransfer(amount, description);

    // DB에 출금 정보 저장
    await savingsService.createTransaction(
      amount,
      userInfo.motherAccount,
      description,
      2,
      categoryIdx
    );

    // DB Budget 테이블 total 업데이트
    let planIdx = await paymentService.findPlanIdx();
    let totalSpent = await paymentService.getTotalSpent(
      categoryIdx,
      userInfo.motherAccount
    );
    planIdx = planIdx.dataValues.planIdx;
    totalSpent = totalSpent.dataValues.amount;
    await paymentService.updateBudgetTotalAmount(
      planIdx,
      categoryIdx,
      totalSpent
    );

    /** 잔돈 저금 */
    const changes = 1000 - (amount % 1000);
    if (changes === 1000) {
      return res
        .status(statusCode.OK)
        .send(
          util.success(statusCode.OK, responseMessage.CREATE_PAYMENT_SUCCESS)
        );
    }

    // 잔돈 출금 이체
    await drawTransfer(changes, description);
    // 농협 입금 이체
    await receivedTransferAccountNumber(changes, description, description);

    // DB에 출금 정보 저장
    await savingsService.createTransaction(
      changes,
      userInfo.motherAccount,
      description,
      4,
      null
    );
    // DB에 입금 정보 저장
    await savingsService.createTransaction(
      changes,
      userInfo.sonAccount,
      description,
      4,
      null
    );
    return res
      .status(statusCode.OK)
      .send(
        util.success(statusCode.OK, responseMessage.CREATE_PAYMENT_SUCCESS)
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
