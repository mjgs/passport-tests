const debug = require('debug')('lib:routes:api:users'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const db = require('../../db');

router.get('/', function(req, res, next) {
  db.getUsers(req.params.username, function(err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(404);
    }

    return res.json({ user: user });
  });
});

router.get('/:username', function(req, res, next) {
  db.getUser(req.params.username, function(err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(404);
    }

    return res.json({ user: user });
  });
});

module.exports = router;
