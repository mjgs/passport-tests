const debug = require('debug')('index');
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const engine = require('ejs-mate');

const app = express();

app.set('host', process.env.HOST || 'localhost');
app.set('port', parseInt(process.env.PORT) || 3000);
app.set('users', require(process.env.USERS || './lib/users'));

module.exports = app;

const passport = require('./lib/setup').passport;
const controllers = require('./lib/controllers');
const middleware = require('./lib/middleware');
const db = require('./lib/db');

app.use(logger('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // secure cookies breaks login when on http because session is not persisted
  // look at res.locals when the next line is commented vs uncommented to verify
  // cookie: { secure: true }
}));
app.use(passport.initialize({ userProperty: 'authenticatedUser' }));
app.use(passport.session());

app.param('username', middleware.loadUser);

app.use(middleware.setVariables([
  'authenticated',
  'authenticatedUsername'
]));

const csrfProtection = csrf();

app.route('/')
  .get(controllers.homepage);

app.route('/login')
  .get(csrfProtection, controllers.login)
  .post(csrfProtection, passport.authenticate('local'), controllers.processLogin);

app.route('/users/:username')
  .get(middleware.ensureAuthenticated(), controllers.profile);

app.route('/logout')
  .get(controllers.logout);

app.use(middleware.handleError);
