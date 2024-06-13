const express = require('express');
const router = express.Router();
const passport = require('passport');
const Admin = require('../models/admin');
const User = require('../models/user');

const {isAdmin} = require('../middleware/isAdmin');

// Admin Signup
router.get('/admin/signup', (req, res) => {
  const adminSignupSecret = process.env.ADMIN_SIGNUP_SECRET;
  const querySecret = req.query._secret;
  if (querySecret === adminSignupSecret) {
  
    res.render('./admin_pages/adminSignup');
  } else {
 res.redirect('/')
  }
});

router.post('/admin/signup', async (req, res, next) => {
  const { username, password } = req.body;
  
  try {
    const foundUser = await Admin.findOne({ username });
    if (foundUser) {
        req.flash('error', 'Email already in use. Try different Email or Login instead.')
      return res.redirect('/admin/signup');
    }
    
    const admin = new Admin({ ...req.body });
    
    await Admin.register(admin, password);
    passport.authenticate('admin')(req, res, () => {
      res.redirect('/admin/login');
    });
  } catch (err) {
    next(err);
  }
});

// Admin Login
router.get('/admin/login', (req, res) => {
  res.render('./admin_pages/adminLogin');
});

router.post('/admin/login', passport.authenticate('admin', {
  failureRedirect: '/admin/login',
  failureFlash: {type: 'error', message: 'Invalid Username/Password'}
}), (req, res) => {
   req.flash('success', 'Welcome back, admin!');
  
  res.redirect('/adminpanel');
});
router.get('/adminpanel', (req, res) => {
  res.render('./admin_pages/adminpanel');
});
router.get('/admin/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/admin/login');
  });
});

module.exports = router;