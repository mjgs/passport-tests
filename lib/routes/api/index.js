const debug = require('debug')('lib:routes:api:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();

router.use('/authentications', require('./authentications'));
router.use('/users', require('./users'));

router.use(function(err, req, res, next) {
  if ((err.name === 'UnauthorizedError') || (err.message === 'UnauthorizedError')) {
    return res.status(403).json({
      errors: {
        message: err.message
      }
    });
  }

  return next(err);
});

module.exports = router;
