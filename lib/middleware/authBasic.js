const passport = require('passport');

/*
 * Passport basic authentication
 */
module.exports = passport.authenticate('basic', { session: false });
