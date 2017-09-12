const debug = require('debug')('index:db');
const app = require('../index');

/*
 * Get a user from the db
 */
function getUser(username, cb) {
  debug(`#getUser: ${username}`);
  const users = app.get('users');
  let user;

  for (var i = 0; i < users.length; i += 1) {
    if (users[i].username === username) {
      user = users[i];
      break;
    }
  }

  if (!user) {
    return cb(new Error('User not found.'));
  }

  debug(`#getUser: found users: ${JSON.stringify(user, 0, 2)}`);
  return cb(null, user);
}

module.exports = {
  getUser: getUser
};
