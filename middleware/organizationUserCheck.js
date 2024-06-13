// Middleware to check if the user is an organization
const isOrganization = (req, res, next) => {
    if (req.user && req.user.role === 'organization') {
      // If the user is an organization, proceed to the next middleware
      next();
    } else {
      // If the user is not an organization, redirect to a different page or show an error
    req.flash('error', 'Access denied. Only organization users can access this page.');
    res.redirect('/user/login'); // Redirect to the homepage or any other page
    }
  };

  module.exports = { isOrganization };