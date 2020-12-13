const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.get('/status', planController.getBudgetStatus);
router.get('/category', planController.expendByCategory);
router.get('/:plan_idx', planController.getBudgetStatusByMonth);
router.get('/:plan_idx/category/:idx', planController.getConsumptionDetail);

module.exports = router;
