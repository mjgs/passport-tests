const debug = require('debug')('app:lib:db'); // eslint-disable-line no-unused-vars
const app = require('../app');
const httpError = require('http-errors');

/*
 * Get a user from the db
 */
function getUser(username, cb) {
  const users = app.get('users');
  let user;

  for (var i = 0; i < users.length; i += 1) {
    if (users[i].username === username) {
      user = users[i];
      break;
    }
  }

  if (!user) {
    return cb(new httpError.NotFound('User not found.'));
  }

  // Return a copy of the data
  const foundUser = Object.assign({}, user);

  debug(`#getUser: found user: ${JSON.stringify(foundUser, 0, 2)}`);
  return cb(null, foundUser);
}

/*
 * Get all users from the db
 */
function getUsers(cb) {
  const users = app.get('users');

  // Return a copy of the data
  const foundUsers = users.map(function(user) {
    return Object.assign({}, user);
  });

  debug(`#getUsers: found users: ${JSON.stringify(foundUsers, 0, 2)}`);
  return cb(null, foundUsers);
}

module.exports = {
  getUser: getUser,
  getUsers: getUsers
};
