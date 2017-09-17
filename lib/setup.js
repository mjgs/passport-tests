const debug = require('debug')('app:lib:setup'); // eslint-disable-line no-unused-vars
const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const db = require('./db');
const httpError = require('http-errors');

const env = process.env.NODE_ENV;
const secret = (env === 'production') ? process.env.SECRET : 'secret';

function setupPassport() {
  debug(`#setupPassport: setting up passport`);
  const localStrategy = new LocalStrategy({ passReqToCallback: true }, localAuthentication);
  passport.use(localStrategy);
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);

  const basicStrategy = new BasicStrategy({ passReqToCallback: true }, basicAuthentication);
  passport.use(basicStrategy);

  const bearerStrategy = new BearerStrategy({ passReqToCallback: true }, BearerAuthentication);
  passport.use(bearerStrategy);

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

function basicAuthentication(req, username, password, done) {
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

    req.authenticated = true;
    req.authenticatedUsername = user.username;
    
    return done(null, user);
  });
}

function BearerAuthentication(req, accessToken, callback) {
  jwt.verify(accessToken, secret, function(err, decodedJwt) {
    if (err) {
      if ((err.name === 'TokenExpiredError') || (err.name === 'JsonWebTokenError')) {
        const data = {};
        if (err.expiredAt) {
          data.expiredAt = err.expiredAt;
        }
        err = Object.assign(new httpError.Unauthorized(err.message), { data: data });
      }
      else {
        err = new httpError.InternalServerError(err.message);
      }
      return callback(err);
    }

    req.authenticated = true;
    req.authenticatedUsername = decodedJwt.username;

    debug(`Successfully verified jwt and authenticated: ${JSON.stringify(decodedJwt, 0, 2)}`);

    // Pass an empty user object, use loadAuthenticatedUser middleware if
    // the authenticated user is needed in the route
    return callback(null, {}, { decodedJwt: decodedJwt });
  });
}

module.exports = {
  passport: setupPassport,
  util: {}
};
