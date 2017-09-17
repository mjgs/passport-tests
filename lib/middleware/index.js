/*
 * Middleware
 *
 * Module exports all the application middleware
 *
 */
module.exports = {
  authenticateBasic: require('./authenticateBasic'),
  authenticateJwtRequired: require('./authenticateJwtRequired'),
  authenticateJwtOptional: require('./authenticateJwtOptional'),
  ensureAuthenticated: require('./ensureAuthenticated'),
  loadUser: require('./loadUser'),
  setAuthStatus: require('./setAuthStatus'),
  setVariables: require('./setVariables')
};
