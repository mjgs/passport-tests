
module.exports = function setAuthStatus(req, res, next) {
  if (req.payload) {
    req.authenticated = true;
    req.authenticatedUsername = req.payload.username;
  }
  else {
    req.authenticated = false;
  }
  return next();
};
