const app = require('../index');
const request = require('supertest');
const expect = require('chai').expect;

function encodeCredentials(username, password) {
  return new Buffer(`${username}:${password}`).toString('base64');
}

function validateListOfUsers(list) {
  list.forEach(function(item) {
    validateUser(item);
  });
}

function validateUser(obj) {
  expect(obj.username).to.be.an('string');
  expect(obj.age).to.be.a('number');
}

describe('Integration tests: api', function() {
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
        validateUser(res.body);
        done();
      });
  });

  it('should retrieve a user for authenticated retrieval of user', function(done) {
    const userUrl = `/api/users/mark`;
    request(app)
      .get(userUrl)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        validateUser(res.body);
        done();
      });
  });

  it('should return 403 for unauthenticated retrieval of users', function(done) {
    const usersUrl = `/api/users`;
    request(app)
      .get(usersUrl)
      .set('Accept', 'application/json')
      .expect(403)
      .end(done);
  });

  it('should retrieve a list for users for authenticated retrieval of users', function(done) {
    const usersUrl = `/api/users`;
    request(app)
      .get(usersUrl)
      .set('Accept', 'application/json')
      .set('Authorization', `Basic ${encodeCredentials(username, password)}`)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        validateListOfUsers(res.body);
        done();
      });
  });
});
