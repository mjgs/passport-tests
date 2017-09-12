# Express app with passport authentication

It's often difficult to troubleshoot authentication issues. This app
just implements [passport](http://passportjs.org/) local authentication,
only the basics. A home page, login page and user profile page and a
logout route.

It's a good starting point to test out other passport authentication strategies,
and also a good minimal example to help troubleshooting authentication
issues in other apps.

## Notes

- Authentication state is stored in the session (see processLogin controller)
- Only the profile page requires authentication to view
- App global variables are stored using express app.set
- Run time app variables are stored in the session
- Any app variables or session variables that are needed by templates
  are set using the setVariables middleware on a route by route basis
- If you use the setVariables middleware correctly then the controller
  functions don't need to set many variables
- The login form implements csrf protection using
  [csurf](https://github.com/expressjs/csurf)
- Use a fake db implemented using a simple javascript object
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
