const passport = require('passport');

/*
 * Passport basic authentication
 */
module.exports = function authBasic(req, res, next) {
  passport.authenticate('basic', { session: false })(req, res, next);
};
