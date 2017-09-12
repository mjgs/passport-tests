const app = require('../index');
const request = require('supertest');
const expect = require('chai').expect;

function encodeCredentials(username, password) {
  return new Buffer(`${username}:${password}`).toString('base64');
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
});
