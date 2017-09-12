const debug = require('debug')('api:authentications');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

router.post('/', passport.authenticate('basic'), function(req, res, next) {
  const user = req.authenticatedUser;
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  const token = jwt.sign({
    username: user.username,
    exp: parseInt(exp.getTime() / 1000),
  }, req.app.get('secret'));

  return res.status(201).json({
    user: user,
    token: token
  });
});

module.exports = router;
