const debug = require('debug')('app:lib:routes:api:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();

router.use('/authentications', require('./authentications'));
router.use('/users', require('./users'));

/*
 * Process API errors and send them on to main handlers
 *
 * e.g.
 *   express-jwt errors use err.name
 *   new Error('blah') use err.message
 */
router.use(function(err, req, res, next) {
  if ((err.name === 'UnauthorizedError') || (err.message === 'UnauthorizedError')) {
    err.status = 403;
    err.message = err.message || err.name;
  }
  return next(err);
});

module.exports = router;
