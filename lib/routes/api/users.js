const debug = require('debug')('api:users');
const router = require('express').Router();
const passport = require('passport');
const db = require('../../db');
const authRequired = require('../../middleware').authRequired;
const authOptional = require('../../middleware').authOptional;

router.get('/', authRequired, function(req, res, next) {
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

router.get('/:username', authOptional, function(req, res, next) {
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
