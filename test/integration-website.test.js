/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
process.env.NODE_ENV = 'test';

const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const cheerio = require('cheerio');

/*
 * Loads the login page, grabs the csrf token from the hidden form field,
 * returns the csrf token
 */
function loadFormCsrf(agent, url, cb) {
  agent
    .get(url)
    .set('Accept', 'text/html; charset=utf-8')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .end(function(err, res) {
      if (err) {
        return cb(err);
      }
      const $ = cheerio.load(res.text);
      const csrfToken = $('body').find('input[name=_csrf]').val();
      expect(csrfToken).to.be.a.string;
      cb(null, csrfToken);
    });
}

/*
 * Determines the logged in status of the user by loading the home page
 * and grabbing the Logged In: true/false portion of the page
 */
function getUserLoggedInStatus(agent, cb) {
  agent
    .get('/')
    .set('Accept', 'text/html; charset=utf-8')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .end(function(err, res) {
      if (err) {
        return cb(err);
      }
      const $ = cheerio.load(res.text);
      const loggedInString = $('body').text().split('\n')[0];
      const loggedIn = loggedInString.split(' ')[2];
      cb(null, loggedIn);
    });
}

/*
 * Validates that an authenticated page has all the links it should have
 */
function hasAuthenticatedPageLinks($) {
  expect($('body').children('a')).to.have.length(5);
  expect($('body').children('a')[0].children[0].data).to.be.equal('home page');
  expect($('body').children('a')[1].children[0].data).to.be.equal('login page');
  expect($('body').children('a')[2].children[0].data).to.be.equal('profile page');
  expect($('body').children('a')[3].children[0].data).to.be.equal('logout');
  expect($('body').children('a')[4].children[0].data).to.be.equal('github');
}

/*
 * Validates that a non-authenticated page has all the links it should have
 */
function hasNonAuthenticatedPageLinks($) {
  expect($('body').children('a')).to.have.length(3);
  expect($('body').children('a')[0].children[0].data).to.be.equal('home page');
  expect($('body').children('a')[1].children[0].data).to.be.equal('login page');
  expect($('body').children('a')[2].children[0].data).to.be.equal('github');
}

/*
 * Validates that a page has the login form
 */
function hasLoginForm($) {
  const form = $('body').children('form');
  expect(form).to.have.length.above(0);
  expect(form.find('input[name=username]')[0].attribs.type).to.be.equal('text');
  expect(form.find('input[name=password]')[0].attribs.type).to.be.equal('password');
  expect(form.find('input[name=_csrf]')[0].attribs.type).to.be.equal('hidden');
  expect(form.find('button')[0].attribs.type).to.be.equal('submit');
}

describe('website: authenticated', function() {
  let agent;

  // Log the user in
  before(function(done) {
    const pageUrl = '/login';
    agent = request.agent(app); // Persist state in the session
    loadFormCsrf(agent, pageUrl, function(err, csrfToken) {
      expect(err).to.be.null;
      agent
        .post(pageUrl)
        .send({ username: 'mark', password: 'password1', _csrf: csrfToken })
        .expect(302)
        .expect('location', `/users/mark`)
        .end(function(err, res) {
          expect(err).to.be.null;
          done();
        });
    });
  });

  // In case the test involved logging out, log the user back in
  afterEach(function(done) {
    agent = request.agent(app);
    const pageUrl = '/login';
    loadFormCsrf(agent, pageUrl, function(err, csrfToken) {
      expect(err).to.be.null;
      agent
        .post(pageUrl)
        .send({ username: 'mark', password: 'password1', _csrf: csrfToken })
        .expect(302)
        .expect('location', `/users/mark`)
        .end(function(err, res) {
          expect(err).to.be.null;
          done();
        });
    });
  });

  it('should render the home page', function(done) {
    // Page displays text 'Logged in: true'
    // Page displays text 'This is the home page'
    // Page contains all the links an authenticated page should have
    const pageUrl = `/`;
    agent
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: true')[0]).to.be.equal('Logged in: true');
        expect($('body').text().match('This is the home page')[0]).to.be.equal('This is the home page');
        hasAuthenticatedPageLinks($);
        done();
      });
  });

  it('should render the login page', function(done) {
    // Page displays text 'Logged in: true'
    // Page displays text 'This is the login page'
    // Page contains all the links an authenticated page should have
    // Page contains a form with username input, password input, hidden _csrf input and Login button
    const pageUrl = `/login`;
    agent
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: true')[0]).to.be.equal('Logged in: true');
        expect($('body').text().match('This is the login page')[0]).to.be.equal('This is the login page');
        hasAuthenticatedPageLinks($);
        hasLoginForm($);
        done();
      });
  });

  it('should render the profile page', function(done) {
    // Page displays text 'Logged in: true'
    // Page displays text 'This is the profile page'
    // Page contains all the links an authenticated page should have
    // Page displays text 'username: <username>'
    // Page displays text 'age: <age>'
    const pageUrl = `/users/mark`;
    agent
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: true')[0]).to.be.equal('Logged in: true');
        expect($('body').text().match('This is the profile page')[0]).to.be.equal('This is the profile page');
        hasAuthenticatedPageLinks($);
        expect($('body').find('li')).to.have.length(2);
        expect($('body').find('li')[0].children[0].data).to.be.equal('username: mark');
        expect($('body').find('li')[1].children[0].data).to.be.equal('age: 32');
        done();
      });
  });

  it('should log the user in and redirect to the profile page', function(done) {
    // Should redirect to the login page
    // User should be logged in
    const pageUrl = `/login`;
    loadFormCsrf(agent, pageUrl, function(err, csrfToken) {
      expect(err).to.be.null;
      agent
        .post(pageUrl)
        .send({ username: 'mark', password: 'password1', _csrf: csrfToken })
        .expect(302)
        .expect('location', `/users/mark`)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.not.be.null;
          getUserLoggedInStatus(agent, function(err, loggedIn) {
            expect(err).to.be.null;
            expect(loggedIn).to.be.equal('true');
            done();
          });
        });
    });
  });

  it('should render the home page then log the user out and redirect to the login page', function(done) {
    // Should render the home page, then click the logout link
    // Should redirect to /login
    // The user should be logged out
    const pageUrl = `/`;
    agent
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: true')[0]).to.be.equal('Logged in: true');
        expect($('body').text().match('This is the home page')[0]).to.be.equal('This is the home page');
        hasAuthenticatedPageLinks($);
        const logoutUrl = $('body').find('a[name=logout]')[0].attribs.href;
        agent
          .get(logoutUrl)
          .set('Accept', 'text/html; charset=utf-8')
          .expect(302)
          .expect('location', `/login`)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.not.be.null;
            getUserLoggedInStatus(agent, function(err, loggedIn) {
              expect(err).to.be.null;
              expect(loggedIn).to.be.equal('false');
              done();
            });
          });
      });
  });

  it('should render the login page then log the user out and redirect to the login page', function(done) {
    // Should render the login page, then click the logout link
    // Should redirect to /login
    // The user should be logged out
    const pageUrl = `/login`;
    agent
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: true')[0]).to.be.equal('Logged in: true');
        expect($('body').text().match('This is the login page')[0]).to.be.equal('This is the login page');
        hasAuthenticatedPageLinks($);
        const logoutUrl = $('body').find('a[name=logout]')[0].attribs.href;
        agent
          .get(logoutUrl)
          .set('Accept', 'text/html; charset=utf-8')
          .expect(302)
          .expect('location', `/login`)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.not.be.null;
            getUserLoggedInStatus(agent, function(err, loggedIn) {
              expect(err).to.be.null;
              expect(loggedIn).to.be.equal('false');
              done();
            });
          });
      });
  });

  it('should render the profile page then log the user out and redirect to the login page', function(done) {
    // Should render the profile page, then click the logout link
    // Should redirect to /login
    // The user should be logged out
    const pageUrl = `/users/mark`;
    agent
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: true')[0]).to.be.equal('Logged in: true');
        expect($('body').text().match('This is the profile page')[0]).to.be.equal('This is the profile page');
        hasAuthenticatedPageLinks($);
        const logoutUrl = $('body').find('a[name=logout]')[0].attribs.href;
        agent
          .get(logoutUrl)
          .set('Accept', 'text/html; charset=utf-8')
          .expect(302)
          .expect('location', `/login`)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.not.be.null;
            getUserLoggedInStatus(agent, function(err, loggedIn) {
              expect(err).to.be.null;
              expect(loggedIn).to.be.equal('false');
              done();
            });
          });
      });
  });
});

describe('website: unauthenticated', function() {
  it('should render the home page', function(done) {
    // Page displays text 'Logged in: false'
    // Page displays text 'This is the home page'
    // Page contains all the links a non-authenticated page should have
    const pageUrl = `/`;
    request(app)
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: false')[0]).to.be.equal('Logged in: false');
        expect($('body').text().match('This is the home page')[0]).to.be.equal('This is the home page');
        hasNonAuthenticatedPageLinks($);
        done();
      });
  });

  it('should render the login page', function(done) {
    // Page displays text 'Logged in: false'
    // Page displays text 'This is the login page'
    // Page contains all the links a non-authenticated page should have
    // Page contains a form with username input, password input, hidden _csrf input and Login button
    const pageUrl = `/login`;
    request(app)
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        const $ = cheerio.load(res.text);
        expect($('body').text().match('Logged in: false')[0]).to.be.equal('Logged in: false');
        expect($('body').text().match('This is the login page')[0]).to.be.equal('This is the login page');
        hasNonAuthenticatedPageLinks($);
        hasLoginForm($);
        done();
      });
  });

  it('should redirect to the login page when profile is requested', function(done) {
    // Request is redirected to /login
    // User should be logged out
    const pageUrl = `/users/mark`;
    request(app)
      .get(pageUrl)
      .set('Accept', 'text/html; charset=utf-8')
      .expect(302)
      .expect('location', `/login`)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        getUserLoggedInStatus(request(app), function(err, loggedIn) {
          expect(err).to.be.null;
          expect(loggedIn).to.be.equal('false');
          done();
        });
      });
  });

  it('should log the user in and redirect to the profile page', function(done) {
    // Should redirect to the login page
    // User should be logged in
    const agent = request.agent(app); // Persist state in the session
    const pageUrl = '/login';
    loadFormCsrf(agent, pageUrl, function(err, csrfToken) {
      expect(err).to.be.null;
      agent
        .post(pageUrl)
        .send({ username: 'mark', password: 'password1', _csrf: csrfToken })
        .expect(302)
        .expect('location', `/users/mark`)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.not.be.null;
          getUserLoggedInStatus(agent, function(err, loggedIn) {
            expect(err).to.be.null;
            expect(loggedIn).to.be.equal('true');
            done();
          });
        });
    });
  });
});
