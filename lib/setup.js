const debug = require('debug')('app:lib:setup'); // eslint-disable-line no-unused-vars
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const db = require('./db');
const httpError = require('http-errors');

function setupPassport() {
  debug(`#setupPassport: setting up passport`);
  const localStrategy = new LocalStrategy({ passReqToCallback: true }, localAuthentication);
  passport.use(localStrategy);
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);

  const basicStrategy = new BasicStrategy({}, basicAuthentication);
  passport.use(basicStrategy);

  return passport;
}

/*
 * Passport authentication
 */
function localAuthentication(req, username, password, done) {
  debug(`#localAuthentication: ${username}`);
  db.getUser(username, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(new httpError.Unauthorized('Invalid username or password.'));
    }
    if (user.password !== password) {
      return done(new httpError.Unauthorized('Invalid username or password.'));
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

function basicAuthentication(username, password, done) {
  debug(`#basicAuthentication: ${username}`);
  db.getUser(username, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(new httpError.Unauthorized('Invalid username or password.'));
    }
    if (user.password !== password) {
      return done(new httpError.Unauthorized('Invalid username or password.'));
    }
    return done(null, user);
  });
}

function getTokenFromHeader(req) {
  if (req.headers.authorization) {
    const tokenAuth = req.headers.authorization.split(' ')[0] === 'Token';
    const bearerAuth = req.headers.authorization.split(' ')[0] === 'Bearer';
    if (tokenAuth || bearerAuth) {
      return req.headers.authorization.split(' ')[1];
    }
  }
  return null;
}

module.exports = {
  passport: setupPassport,
  util: {
    getTokenFromHeader: getTokenFromHeader
  }
};
