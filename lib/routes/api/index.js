const debug = require('debug')('app:lib:routes:api:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();

router.use('/authentications', require('./authentications'));
router.use('/users', require('./users'));

/*
 * Process API errors and send them on to main handlers
 *
 * Some libraries don't provide callbacks to handle the errors
 * they throw so this is a good place to process the error
 * before sending it to the main application error handlers.
 */
router.use(function(err, req, res, next) {
  // Add custom error handling here...
  // Create httpError and pass to next
  return next(err);
});

module.exports = router;
