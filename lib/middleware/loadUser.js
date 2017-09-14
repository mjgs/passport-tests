const debug = require('debug')('app:lib:middleware:loadUser'); // eslint-disable-line no-unused-vars
const db = require('../db');

/*
 * Load the user specified by username url parameter
 */
module.exports = function loadUser(req, res, next, username) {
  db.getUser(username, function(err, user) {
    if (err) {
      return next(err);
    }
    req.session.user = user;
    return next();
  });
};
