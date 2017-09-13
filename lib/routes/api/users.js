const debug = require('debug')('lib:routes:api:users'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const db = require('../../db');
const setup = require('../../setup');

router.get('/', setup.jwtAuthRequired, function(req, res, next) {
  db.getUsers(function(err, users) {
    if (err) {
      return next(err);
    }

    return res.json({ users: users });
  });
});

router.get('/:username', setup.jwtAuthOptional, function(req, res, next) {
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
