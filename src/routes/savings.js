const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');

router.post('/', savingsController.makeSavings);

module.exports = router;
