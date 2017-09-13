const debug = require('debug')('lib:routes:website:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();

router.use('/', require('./login'));

module.exports = router;
