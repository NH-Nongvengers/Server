const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.get('/status', planController.getBudgetStatus);

module.exports = router;
