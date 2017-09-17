const debug = require('debug')('app:lib:routes:api:users'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const db = require('../../db');
const authenticateBearer = require('../../middleware').authenticateBearer;
const authenticateBearerOptional = require('../../middleware').authenticateBearerOptional;

router.get('/', authenticateBearer, function read(req, res, next) {
  db.getUsers(function(err, users) {
    if (err) {
      return next(err);
    }

    return res.json({ users: users });
  });
});

router.get('/:username', authenticateBearerOptional, function readOne(req, res, next) {
  db.getUser(req.params.username, function(err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(404);
    }

    // Return full details
    const isSelf = req.authenticatedUsername === req.params.username;
    if (req.authenticated && isSelf) {
      return res.json({ user: user });
    }

    // Return partial details
    else {
      delete user.password;
      return res.json({ user: user });
    }
  });
});

module.exports = router;
