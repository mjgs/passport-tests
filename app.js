const debug = require('debug')('app'); // eslint-disable-line no-unused-vars
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const engine = require('ejs-mate');

const app = express();

app.set('env', process.env.NODE_ENV || 'development');
app.set('host', process.env.HOST || 'localhost');
app.set('port', parseInt(process.env.PORT) || 3000);
app.set('users', require(process.env.USERS || './lib/store/users'));
app.set('secret', (app.get('env') === 'production') ? process.env.SECRET : 'secret');

module.exports = app;

const passport = require('./lib/setup').passport;
const middleware = require('./lib/middleware');

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

app.use(middleware.setVariables([
  'authenticated',
  'authenticatedUsername'
]));

app.use('/', require('./lib/routes/website'));
app.use('/api', require('./lib/routes/api'));

app.use(middleware.handleError);
