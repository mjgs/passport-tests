const debug = require('debug')('api:users');
const router = require('express').Router();
const passport = require('passport');
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
