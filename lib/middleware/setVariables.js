const debug = require('debug')('app:lib:middleware:setVariables'); // eslint-disable-line no-unused-vars

/*
 * Makes available a list of variables from app.locals / req.session to templates
 * via res.locals. The session overrides the app value.
 */
module.exports = function setVariables(variables) {
  variables = variables || [];

  return function setVariables(req, res, next) {
    debug(`setting variables: ${variables}`);
    variables.forEach(function(key) {
      debug(`req.session[${key}]: ${req.session[key]}`);
      debug(`req.app.get(${key}): ${req.app.get(key)}`);
      res.locals[key] = req.session[key] || req.app.get(key);
    });
    return next();
  };
};
