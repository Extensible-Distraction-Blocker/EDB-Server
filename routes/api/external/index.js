var express = require('express');
var router = express.Router();

router.use('/', require('./external'));

module.exports = router;

