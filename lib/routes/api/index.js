const debug = require('debug')('lib:routes:api:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();

router.use('/authentications', require('./authentications'));
router.use('/users', require('./users'));

router.use(function(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
