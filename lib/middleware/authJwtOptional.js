const app = require('../../app');
const util = require('../setup').util;
const jwt = require('express-jwt');

/*
 * Allow Jwt authentication
 */
module.exports = jwt({
  secret: app.get('secret'),
  requestProperty: 'payload',
  credentialsRequired: false,
  getToken: util.getTokenFromHeader
});
