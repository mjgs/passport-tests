const debug = require('debug')('lib:routes:api:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const app = require('../../../app');

router.use('/authentications', require('./authentications'));
router.use('/users', require('./users'));

// development error handler
// will print stacktrace
if (app.get('env') !== 'production') {
  router.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500);
    statusOverrides(err, res);
    return res.json({
      errors: [{
        message: err.message,
        error: err
      }]
    });
  });
}

// production error handler
// no stacktraces leaked to user
router.use(function(err, req, res, next) {
  res.status(err.status || 500);
  statusOverrides(err, res);
  res.json({
    errors: [{
      message: err.message,
      error: {}
    }]
  });
});

function statusOverrides(err, res) {
  if ((err.name === 'UnauthorizedError') || (err.message === 'UnauthorizedError')) {
    res.status(403);
  }
}

module.exports = router;
