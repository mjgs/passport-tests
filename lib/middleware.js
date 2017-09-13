/*
 * Ensures request is authenticated by redirecting to loginUrl
 * if it isn't.
 *
 * Makes authentication status available to templates as variable:
 *   - authentication
 */
const debug = require('debug')('lib:middleware'); // eslint-disable-line no-unused-vars
const db = require('./db');
const jwt = require('express-jwt');

/*
 * Redirects user to options.redirect if not authenticated
 */
function ensureAuthenticated(options) {
  options = options || {};
  const loginUrl = options.redirect || '/login';

  return function ensureAuthenticated(req, res, next) {
    if (typeof req.session.authenticated === 'undefined') {
      req.session.redirectUrl = req.originalUrl;
      debug(`#ensureAuthenticated: redirecting to login page: ${loginUrl}`);
      return res.redirect(loginUrl);
    }
    else {
      debug(`#ensureAuthenticated: user is authenticated: ${req.session.authenticatedUser.username}`);
      return next();
    }
  };
};

/*
 * Makes available a list of variables from app.locals / req.session to templates
 * via res.locals. The session overrides the app value.
 */
function setVariables(variables) {
  variables = variables || [];

  return function setVariables(req, res, next) {
    debug(`#setVariables: setting variables: ${variables}`);
    variables.forEach(function(key) {
      debug(`#setVariables: req.session[${key}]: ${req.session[key]}`);
      debug(`#setVariables: req.app.get(${key}): ${req.app.get(key)}`);
      res.locals[key] = req.session[key] || req.app.get(key);
    });
    return next();
  };
}

/*
 * Load the user specified by username url parameter
 */
function loadUser(req, res, next, username) {
  db.getUser(username, function(err, user) {
    if (err) {
      return next(err);
    }
    req.session.user = user;
    return next();
  });
}

/*
 * Error handler
 */
function handleError(err, req, res, next) {
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
}

function jwtAuth(options) {
  options = options || {};

  return function jwtAuth(req, res, next) {
    jwt(options)(req, res, next);
  };
}

module.exports = {
  setVariables: setVariables,
  ensureAuthenticated: ensureAuthenticated,
  loadUser: loadUser,
  jwtAuth: jwtAuth,
  handleError: handleError
};
