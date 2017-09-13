const debug = require('debug')('lib:routes:website:users'); // eslint-disable-line no-unused-vars
const router = require('express').Router();
const passport = require('passport');
const csrf = require('csurf');
const middleware = require('../../middleware');

const csrfProtection = csrf();

router.param('username', middleware.loadUser);

router.get('/', function(req, res) {
  const locals = {
    message: 'This is the home page',
    _layoutFile: '_layout'
  };
  debug(`#homepage: ${JSON.stringify({ locals: locals, 'res.locals': res.locals }, 0, 2)}`);
  return res.render('home', locals);
});

router.get('/login', csrfProtection, function(req, res) {
  const locals = {
    message: 'This is the login page',
    csrfToken: req.csrfToken(),
    _layoutFile: '_layout'
  };
  debug(`#login: ${JSON.stringify({ locals: locals, 'res.locals': res.locals }, 0, 2)}`);
  return res.render('login', locals);
});

router.post('/login', csrfProtection, passport.authenticate('local'), function(req, res, next) {
  const user = req.authInfo.authenticatedUser;
  const redirectUrl = req.session.redirectlUrl || `/users/${user.username}`;

  // Set authenticated state on successful login
  //
  // If you are using an API to authenticate it's a good idea to store authentication
  // state in the session because if the API goes down, since passport's
  // req.isAuthenticated() bases it's result on whether passport.deserializeUser
  // was successful, it's not always accurate.
  //
  // Note that req.session.authenticatedUser and req.session.authenticatedUsername
  // will be set in passport.deserializeUser for freshness
  req.session.authenticated = true;

  debug(`#processLogin: user is authenticated: ${user.username}`);
  debug(`#processLogin: redirecting to: ${redirectUrl}`);
  debug(`#processLogin: ${JSON.stringify({ locals: {}, 'res.locals': res.locals }, 0, 2)}`);
  return res.redirect(redirectUrl);
});

router.get('/users/:username', middleware.ensureAuthenticated(), function(req, res) {
  const user = req.session.user;
  delete user.password;
  const locals = {
    message: 'This is the profile page',
    user: user,
    _layoutFile: '_layout'
  };
  debug(`#profile: ${JSON.stringify({ locals: locals, 'res.locals': res.locals }, 0, 2)}`);
  return res.render('profile', locals);
});

router.get('/logout', function(req, res) {
  req.session.destroy(); // Delete the session to logout
  debug('#logout: Logging out.');
  debug(`#logout: ${JSON.stringify({ locals: {}, 'res.locals': res.locals }, 0, 2)}`);
  return res.redirect('/login');
});

module.exports = router;
