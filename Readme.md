# Express app with passport authentication

It's often difficult to troubleshoot authentication issues. This app
just implements the [passport](http://passportjs.org/) basics on a
minimal website and api.

The website:

- home page
- login page
- user profile page
- logout route

The api:

- /api/authentications - get a jwt auth token (basic auth required)
- /api/users           - get users            (jwt auth required)
- /api/users/:username - get user             (jwt auth optional)

It's a good starting point to test out other passport authentication strategies,
and also a good minimal example to help troubleshooting authentication
issues in other apps.

## Notes on the website

- Authentication state is stored in the session (see POST /login route)
- Only the profile page requires authentication to view
- App global variables are stored using express app.set
- Run time app variables are stored in the session
- Any app variables or session variables that are needed by templates
  are set using the setVariables middleware on a route by route basis
- If you use the setVariables middleware correctly then the route handler
  functions don't need to set many variables
- The login form implements csrf protection using
  [csurf](https://github.com/expressjs/csurf)
- Uses a fake db implemented using a simple javascript object
  (lib/users.js)

## Installation

```
npm install
DEBUG=index:*; npm start
```

## Test

```
npm test
```
