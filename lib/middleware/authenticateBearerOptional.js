const debug = require('debug')('app:lib:middleware:authenticateBearer'); // eslint-disable-line no-unused-vars
const passport = require('passport');
const httpError = require('http-errors'); // eslint-disable-line no-unused-vars

/*
 * Passport bearer authentication
 */
module.exports = function authenticateBearer(req, res, next) {
  // It's necessary to pass a custom callback to passport.authenticate.
  //
  // Since authentication is optional, allow the request to pass if there
  // is an authentication error caused by the request not having the
  // Authorization header set
  passport.authenticate('bearer', { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }

    // Problem with the Authorization header in request
    if (user === false) {
      req.authenticated = false;
      debug(`setting req.authenticated: ${req.authenticated}`);
      return next();
    }

    return next();
  })(req, res, next);
};
