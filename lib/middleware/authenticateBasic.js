const debug = require('debug')('app:lib:middleware:authenticateBasic'); // eslint-disable-line no-unused-vars
const passport = require('passport');
const httpError = require('http-errors');

/*
 * Passport basic authentication
 */
module.exports = function authenticateBasic(req, res, next) {
  // It's necessary to pass a custom callback to passport.authenticate.
  //
  // Unfortunately if no Authentication header is used (i.e. an
  // unauthenticated request), passport responds without erroring,
  // the response body is empty and the www-authenticate header is
  // set to "Bearer realm=\"Users\"".
  //
  // Pass a callback to passport.authenticate here and raise an error for that
  // situation, the error will then be handled by the errorHandler middleware.
  passport.authenticate('basic', { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }

    // Problem with the Authorization header in request
    if ((user === false) && (info === 'Basic realm="Users"')) {
      return next(new httpError.Unauthorized('Missing request header - Authorization: Basic [base64-encoding of \'username:password\']'));
    }

    return next();
  })(req, res, next);
};
