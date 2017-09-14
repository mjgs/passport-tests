const debug = require('debug')('app:lib:middleware:setAuthStatus'); // eslint-disable-line no-unused-vars

/*
 * Sets auth status and authenticated username on request object
 */
module.exports = function setAuthStatus(req, res, next) {
  if (req.payload) {
    req.authenticated = true;
    req.authenticatedUsername = req.payload.username;
  }
  else {
    req.authenticated = false;
  }

  debug(`req.authenticated: ${req.authenticated}`);
  debug(`req.authenticatedUsername: ${req.authenticatedUsername}`);

  return next();
};
