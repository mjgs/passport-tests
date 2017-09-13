const debug = require('debug')('lib:routes:website:users'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const passport = require('passport');
const csrf = require('csurf');
const controllers = require('../../controllers');
const middleware = require('../../middleware');

const csrfProtection = csrf();

router.param('username', middleware.loadUser);

router.route('/')
  .get(controllers.homepage);

router.route('/login')
  .get(csrfProtection, controllers.login)
  .post(csrfProtection, passport.authenticate('local'), controllers.processLogin);

router.route('/users/:username')
  .get(middleware.ensureAuthenticated(), controllers.profile);

router.route('/logout')
  .get(controllers.logout);

module.exports = router;
