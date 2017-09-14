const util = require('../setup').util;
const jwt = require('express-jwt');
const setAuthStatus = require('../middleware').setAuthStatus;

/*
 * Allow Jwt authentication
 */
module.exports = function(req, res, next) {
  return [
    jwt({
      secret: req.app.get('secret'),
      requestProperty: 'payload',
      getToken: util.getTokenFromHeader
    })(req, res, next),
    setAuthStatus
  ];
};
