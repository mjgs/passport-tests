/*
 * Middleware
 *
 * Module exports all the application middleware
 *
 */
module.exports = {
  authBasic: require('./authBasic'),
  authJwtRequired: require('./authJwtRequired'),
  authJwtOptional: require('./authJwtOptional'),
  ensureAuthenticated: require('./ensureAuthenticated'),
  handleError: require('./handleError'),
  loadUser: require('./loadUser'),
  setAuthStatus: require('./setAuthStatus'),
  setVariables: require('./setVariables')
};
