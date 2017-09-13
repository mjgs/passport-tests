const debug = require('debug')('lib:routes:website:index'); // eslint-disable-line no-unused-vars
const router = require('express').Router();

router.use('/', require('./login'));

router.use(function(err, req, res, next) {
  console.trace(err);

  // This is a good place to force user logout if you are authenticating
  // to an API that has gone down, necessary due to login loops
  if (err.code === 'ECONNREFUSED') {
    if (req.session.authenticated) {
      debug('API is down, logging user off and redirecting to login page...');
      req.session.destroy();
      return res.redirect('/login');
    }
  }

  return next(err);
});

module.exports = router;
