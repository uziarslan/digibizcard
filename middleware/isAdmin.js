module.exports.isAdmin = (req, res, next) => {
    if(!req.user) {
        // The user is authenticated and is an admin
        req.flash('error', "Sign up/Sign in First");
        res.redirect('/admin/login')
      } else {
        return next();
      }
    };
    
  
    
   
    
    