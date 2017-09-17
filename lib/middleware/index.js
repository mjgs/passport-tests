/*
 * Middleware
 *
 * Module exports all the application middleware
 *
 */
module.exports = {
  authenticateBasic: require('./authenticateBasic'),
  authenticateBearer: require('./authenticateBearer'),
  authenticateBearerOptional: require('./authenticateBearerOptional'),
  ensureAuthenticated: require('./ensureAuthenticated'),
  loadAuthenticatedUser: require('./loadAuthenticatedUser'),
  loadUser: require('./loadUser'),
  setAuthStatus: require('./setAuthStatus'),
  setVariables: require('./setVariables')
};
