/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
process.env.NODE_ENV = 'test';

const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');

const env = process.env.NODE_ENV;
const secret = (env === 'production') ? process.env.SECRET : 'secret';

function encodeCredentials(username, password) {
  return Buffer.from(`${username}:${password}`).toString('base64');
}

function validateListOfUsers(list) {
  list.forEach(function(item) {
    validatePrivateUser(item);
  });
}

function validatePublicUser(obj) {
  expect(obj.username).to.be.a('string');
  expect(obj.age).to.be.a('number');
  expect(obj.password).to.be.undefined;
}

function validatePrivateUser(obj) {
  expect(obj.username).to.be.a('string');
  expect(obj.password).to.be.a('string');
  expect(obj.age).to.be.a('number');
}

function validateError(obj) {
  expect(obj.errors).to.be.an('object');
  expect(obj.errors.message).to.be.a('string');
  expect(obj.errors.status).to.be.a('number');
  expect(obj.errors.data).to.be.an('array');
}

function getAuthToken(agent, username, password, cb) {
  const authUrl = `/api/authentications`;
  agent
    .post(authUrl)
    .set('Accept', 'application/json')
    .set('Authorization', `Basic ${encodeCredentials(username, password)}`)
    .expect(201)
    .end(function(err, res) {
      if (err) {
        return cb(err);
      }
      return cb(null, res.body.token);
    });
}

describe('api', function() {
  const username = 'mark';
  const password = 'password1';
  const authUrl = `/api/authentications`;
  const userUrl = `/api/users/mark`;
  const usersUrl = `/api/users`;

  describe('Authentication', function() {
    describe('Basic Authentication (success)', function() {
      it('should authenticate to get an auth token', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .expect(201)
          .set('Authorization', `Basic ${encodeCredentials(username, password)}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.body.token).to.be.a('string');
            expect(res.body.user).to.be.an('object');
            done();
          });
      });
    });

    describe('Basic Authentication (fail)', function() {
      it('should return 401 Unauthorized - No Authentication header', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });

      it('should return 401 Unauthorized - Authentication header: username:badpassword', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${Buffer.from(`${username}:BADPASSWORD`).toString('base64')}`)
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });

      it('should return 401 Unauthorized - Authentication header: badusername:password', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${Buffer.from(`BADUSERNAME:${password}`).toString('base64')}`)
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });

      it('should return 401 Unauthorized - Authentication header: badusername:badpassword', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${Buffer.from(`BADUSERNAME:BADPASSWORD`).toString('base64')}`)
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });

      it('should return 401 Unauthorized - Authentication header: nousername:password', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${Buffer.from(`:${password}`).toString('base64')}`)
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });

      it('should return 401 Unauthorized - Authentication header: username:nopassword', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${Buffer.from(`${username}:`).toString('base64')}`)
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });

      it('should return 401 Unauthorized - Authentication header: nousername:nopassword', function(done) {
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${Buffer.from(':').toString('base64')}`)
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            done();
          });
      });
    });

    describe('Bearer Authentication (success)', function() {
      it('should retrieve user full details', function(done) {
        getAuthToken(request(app), username, password, function(err, token) {
          expect(err).to.be.null;
          request(app)
            .get(userUrl)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function(err, res) {
              expect(err).to.be.null;
              validatePrivateUser(res.body.user);
              done();
            });
        });
      });
    });

    describe('Bearer Authentication (fail)', function() {
      it('should return 401 Unauthorized when Authorization header: bad jwt token', function(done) {
        const badJwtToken = 'qwertyuiopasdfghjklzxcvbnm';
        request(app)
          .get(userUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${badJwtToken}`)
          .expect(401)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            expect(res.body.errors.message).to.be.equal('jwt malformed');
            done();
          });
      });

      it('should return 401 Unauthorized when Authorization header: expired jwt token', function(done) {
        const expiredUserJwtToken = jwt.sign({
          username: username
        }, secret, {
          expiresIn: 0
        });
        request(app)
          .get(userUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${expiredUserJwtToken}`)
          .expect(401)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            expect(err).to.be.null;
            validateError(res.body);
            expect(res.body.errors.message).to.be.equal('jwt expired');
            done();
          });
      });

      it('should return 401 Unauthorized when Authorization header: empty', function(done) {
        request(app)
          .get(usersUrl)
          .set('Accept', 'application/json')
          .set('Authorization', '')
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.body.errors.message).to.be.equal('Missing request header - Authorization: Bearer [token]');
            done();
          });
      });

      it('should return 401 Unauthorized when Authorization header: missing token', function(done) {
        request(app)
          .get(usersUrl)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ')
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.body.errors.message).to.be.equal('Missing request header - Authorization: Bearer [token]');
            done();
          });
      });

      it('should return 401 Unauthorized when Authorization header: missing token and no space', function(done) {
        request(app)
          .get(usersUrl)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer')
          .expect(401)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.body.errors.message).to.be.equal('Missing request header - Authorization: Bearer [token]');
            done();
          });
      });
    });
  });

  describe('Users API', function() {
    describe('GET /api/users/:username (success)', function() {
      it('should retrieve a user for unauthenticated retrieval of user', function(done) {
        const userUrl = `/api/users/mark`;
        request(app)
          .get(userUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${encodeCredentials(username, password)}`)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            expect(err).to.be.null;
            validatePublicUser(res.body.user);
            done();
          });
      });

      it('should retrieve a user for authenticated retrieval of user', function(done) {
        const userUrl = `/api/users/mark`;
        getAuthToken(request(app), 'mark', 'password1', function(err, token) {
          expect(err).to.be.null;
          request(app)
            .get(userUrl)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function(err, res) {
              expect(err).to.be.null;
              validatePrivateUser(res.body.user);
              return done();
            });
        });
      });
    });

    describe('GET /api/users (success)', function() {
      it('should retrieve a list for users for authenticated retrieval of users', function(done) {
        const usersUrl = `/api/users`;
        getAuthToken(request(app), 'mark', 'password1', function(err, token) {
          expect(err).to.be.null;
          request(app)
            .get(usersUrl)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .end(function(err, res) {
              expect(err).to.be.null;
              validateListOfUsers(res.body.users);
              done();
            });
        });
      });
    });

    describe('GET /api/users (fail)', function() {
      it('should 401 for unauthenticated retrieval of users', function(done) {
        const usersUrl = `/api/users`;
        request(app)
          .get(usersUrl)
          .set('Accept', 'application/json')
          .expect(401)
          .end(done);
      });
    });
  });
});
