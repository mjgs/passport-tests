const debug = require('debug')('app:lib:middleware:authenticateJwtRequired'); // eslint-disable-line no-unused-vars
const util = require('../setup').util;
const jwt = require('express-jwt');

/*
 * Allow Jwt authentication
 */
module.exports = function authenticateJwtRequired(req, res, next) {
  jwt({
    secret: req.app.get('secret'),
    requestProperty: 'payload',
    getToken: util.getTokenFromHeader
  })(req, res, next);
};
