const debug = require('debug')('app:lib:routes:api:authentications'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const middleware = require('../../middleware');

router.post('/', middleware.authenticateBasic, function read(req, res, next) {
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
