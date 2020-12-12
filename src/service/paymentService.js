const { TransactionDetail, Plan, Budget } = require('../models');
const moment = require('moment');
const sequelize = require('sequelize');

/**
 * 기간에 해당하는 planIdx 찾기
 */
exports.findPlanIdx = async () => {
  const now = moment();
  try {
    const planIdx = await Plan.findOne({
      attributes: ['planIdx'],
      where: {
        startDate: { [sequelize.Op.lte]: now },
        endDate: { [sequelize.Op.gte]: now },
      },
    });
    return planIdx;
  } catch (err) {
    throw err;
  }
};

/**
 * 기간과 카테고리에 해당하는 총 사용 금액 조회
 */
exports.getTotalSpent = async (categoryIdx, account) => {
  const now = moment().format('YYYY-MM').toString();
  try {
    const totalSpent = await TransactionDetail.findOne({
      attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'amount']],
      where: {
        account: account,
        transactionType: 2, // 출금
        categoryIdx: categoryIdx,
        createdAt: {
          [sequelize.Op.startsWith]: now,
        },
      },
    });
    return totalSpent;
  } catch (err) {
    throw err;
  }
};

/**
 * Budget 테이블의 Total 컬럼 업데이트
 */
exports.updateBudgetTotalAmount = async (planIdx, categoryIdx, amount) => {
  try {
    if (!amount) {
      amount = 0;
    }
    await Budget.update(
      { total: amount },
      {
        where: {
          planIdx: planIdx,
          categoryIdx: categoryIdx,
        },
      }
    );
  } catch (err) {
    throw err;
  }
};
