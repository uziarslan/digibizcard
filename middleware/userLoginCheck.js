

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/user/login");
  }
  
  module.exports = { isLoggedIn };
  