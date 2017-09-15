/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
process.env.NODE_ENV = 'test';

const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const async = require('async');

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

describe('api', function() {
  const username = 'mark';
  const password = 'password1';

  it('should authenticate to get an auth token', function(done) {
    const authUrl = `/api/authentications`;
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
    async.waterfall([
      // Get an auth token
      function(callback) {
        const authUrl = `/api/authentications`;
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${encodeCredentials(username, password)}`)
          .expect(201)
          .end(function(err, res) {
            if (err) {
              return callback(err);
            }
            return callback(null, res.body.token);
          });
      },
      // Retrieve the users
      function(token, callback) {
        request(app)
          .get(userUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Token ${token}`)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              return callback(err);
            }
            return callback(null, res.body.user);
          });
      }
    ], function(err, results) {
      expect(err).to.be.null;
      validatePrivateUser(results);
      done();
    });
  });

  it('should 401 for unauthenticated retrieval of users', function(done) {
    const usersUrl = `/api/users`;
    request(app)
      .get(usersUrl)
      .set('Accept', 'application/json')
      .expect(401)
      .end(done);
  });

  it('should retrieve a list for users for authenticated retrieval of users', function(done) {
    const usersUrl = `/api/users`;
    async.waterfall([
      // Get an auth token
      function(callback) {
        const authUrl = `/api/authentications`;
        request(app)
          .post(authUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Basic ${encodeCredentials(username, password)}`)
          .end(function(err, res) {
            if (err) {
              return callback(err);
            }
            return callback(null, res.body.token);
          });
      },
      // Retrieve the users
      function(token, callback) {
        request(app)
          .get(usersUrl)
          .set('Accept', 'application/json')
          .set('Authorization', `Token ${token}`)
          .end(function(err, res) {
            if (err) {
              return callback(err);
            }
            return callback(null, res.body.users);
          });
      }
    ], function(err, results) {
      expect(err).to.be.null;
      validateListOfUsers(results);
      done();
    });
  });
});
