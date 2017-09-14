const app = require('../../app');
const util = require('../setup').util;
const jwt = require('express-jwt');

/*
 * Allow Jwt authentication
 */
module.exports = function(req, res, next) {
  function setAuthStatus(err) {
    if (err) {
      return next(err);
    }
    if (req.payload) {
      req.authenticated = true;
      req.authenticatedUsername = req.payload.username;
    }
    else {
      req.authenticated = false;
    }
    return next();
  }

  jwt({
    secret: app.get('secret'),
    requestProperty: 'payload',
    getToken: util.getTokenFromHeader
  })(req, res, setAuthStatus);
};
