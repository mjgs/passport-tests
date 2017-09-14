/*
 * Middleware
 *
 * Module exports all the application middleware
 *
 */
module.exports = {
  authJwtRequired: require('./authJwtRequired'),
  authJwtOptional: require('./authJwtOptional'),
  ensureAuthenticated: require('./ensureAuthenticated'),
  handleError: require('./handleError'),
  loadUser: require('./loadUser'),
  setVariables: require('./setVariables')
};
