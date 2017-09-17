const debug = require('debug')('lb:api:middleware:loadAuthenticatedUser'); // eslint-disable-line no-unused-vars
const httpError = require('http-errors');
const db = require('../db');

/*
 * Loads authenticated user, sets on the req object.
 * Intended to be used after the authenticate middleware if the full
 * user object is required.
 */
module.exports = function loadAuthenticatedUser(req, res, next) {
  if (req.authenticated) {
    db.getUser(req.authenticatedUsername, function(err, user) {
      if (err) {
        return next(Object.assign(new httpError.InternalServerError(), { data: err }));
      }

      if (!user) {
        return next(new httpError.NotFound('Authenticated user not found.'));
      }

      req.authenticatedUser = user;
      return next();
    });
  }
  else {
    return next();
  }
};
