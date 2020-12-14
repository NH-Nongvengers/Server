const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');

/** 저축하기 */
router.post('/', savingsController.makeSavings);

/** 저금통 확인하기 */
router.get('/', savingsController.getAllSavings);

/** 월별 절약 저축 금액 확인하기 */
router.get('/monthly', savingsController.getMonthlySavedSavings);

/** 잔돈 모으기 저축 내역 조회 */
router.get('/changes', savingsController.getChangesSavingsHistory);

/** 해당 월에 절약저금으로 모인 금액 조회 */
router.get('/saved', savingsController.getSavedSavingsAmount);

/** 티끌 모으기 저축 내역 조회 */
router.get('/coins', savingsController.getCoinsSavingsHistory);

module.exports = router;
