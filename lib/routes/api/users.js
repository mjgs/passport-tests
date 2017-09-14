const debug = require('debug')('app:lib:routes:api:users'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const db = require('../../db');
const authJwtOptional = require('../../middleware').authJwtOptional;
const authJwtRequired = require('../../middleware').authJwtRequired;
const setAuthStatus = require('../../middleware').setAuthStatus;

router.get('/', authJwtRequired, setAuthStatus, function read(req, res, next) {
  db.getUsers(function(err, users) {
    if (err) {
      return next(err);
    }

    return res.json({ users: users });
  });
});

router.get('/:username', authJwtOptional, setAuthStatus, function readOne(req, res, next) {
  db.getUser(req.params.username, function(err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(404);
    }

    // Return full details
    if (req.payload && req.payload.username === req.params.username) {
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
