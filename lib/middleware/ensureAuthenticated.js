const debug = require('debug')('app:lib:middleware:ensureAuthenticated'); // eslint-disable-line no-unused-vars

/*
 * Redirects user to options.redirect if not authenticated
 */
module.exports = function ensureAuthenticated(options) {
  options = options || {};
  const loginUrl = options.redirect || '/login';

  return function ensureAuthenticated(req, res, next) {
    if (typeof req.session.authenticated === 'undefined') {
      req.session.redirectUrl = req.originalUrl;
      debug(`redirecting to login page: ${loginUrl}`);
      return res.redirect(loginUrl);
    }
    else {
      debug(`user is authenticated: ${req.session.authenticatedUser.username}`);
      return next();
    }
  };
};
