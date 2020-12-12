var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/savings', require('./savings'));
router.use('/api/plan', require('./plan'));
router.use('/api/payment', require('./payment'));

module.exports = router;
