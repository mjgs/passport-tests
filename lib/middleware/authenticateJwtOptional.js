const debug = require('debug')('app:lib:middleware:authenticateJwtOptional'); // eslint-disable-line no-unused-vars
const util = require('../setup').util;
const jwt = require('express-jwt');

/*
 * Allow Jwt authentication
 */
module.exports = function authenticateJwtOptional(req, res, next) {
  jwt({
    secret: req.app.get('secret'),
    requestProperty: 'payload',
    credentialsRequired: false,
    getToken: util.getTokenFromHeader
  })(req, res, next);
};
