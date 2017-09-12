const debug = require('debug')('index:setupPassport');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');

const strategy = new LocalStrategy({ passReqToCallback: true }, authentication);
passport.use(strategy);
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

/*
 * Passport authentication
 */
function authentication(req, username, password, done) {
  debug(`#authentication: ${username}`);
  db.getUser(username, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(new Error('User not found.'));
    }
    if (user.password !== password) {
      return done(new Error('Password match error'));
    }
    return done(null, user, {
      authenticatedUser: user
    });
  });
}

/*
 * Passport serializeUser
 */
function serializeUser(req, user, done) {
  debug(`#serializeUser: ${user.username}`);
  return done(null, user.username);
}

/*
 * Passport deserializeUser
 */
function deserializeUser(req, username, done) {
  debug(`#deserializeUser: ${username}`);
  db.getUser(username, function(err, user) {
    if (err) {
      return done(err);
    }

    // Store separately to make setVariables middleware simpler
    req.session.authenticatedUser = user;
    req.session.authenticatedUsername = user.username;

    return done(null, user);
  });
}

module.exports = {
  passport: passport
};
