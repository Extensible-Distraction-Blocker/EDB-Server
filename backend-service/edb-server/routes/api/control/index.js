var express = require('express');
var router = express.Router();

router.use('/', require('./control'));

module.exports = router;

