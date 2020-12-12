const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');

/** 저축하기 */
router.post('/', savingsController.makeSavings);

/** 저금통 확인하기 */
router.get('/', savingsController.getAllSavings);

module.exports = router;
