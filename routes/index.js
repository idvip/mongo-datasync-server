var express = require('express');
var ctrl = require('../controller/indexController.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/bak/submit',ctrl.bakSubmit);
router.post('/bak/check',ctrl.bakCheck);
router.post('/bak/clean',ctrl.bakClean);
module.exports = router;
