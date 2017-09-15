const debug = require('debug')('app:lib:middleware:authenticateBasic'); // eslint-disable-line no-unused-vars
const passport = require('passport');

/*
 * Passport basic authentication
 */
module.exports = function authenticateBasic(req, res, next) {
  passport.authenticate('basic', { session: false })(req, res, next);
};
