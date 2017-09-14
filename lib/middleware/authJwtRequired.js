const app = require('../../app');
const util = require('../setup').util;
const jwt = require('express-jwt');

/*
 * Allow Jwt authentication
 */
module.exports = jwt({
  secret: app.get('secret'),
  userProperty: 'payload',
  getToken: util.getTokenFromHeader
});
