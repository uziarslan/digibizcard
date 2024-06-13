const express = require('express');
const router = express.Router();
const passport = require("passport");
const facebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

passport.use(new facebookStrategy({
    clientID: "888565963269036",
    clientSecret: "be64ac71ce61faad2f30cf9e5cff236d",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'displayName', 'gender', 'picture.type(large)']
},
async function(accessToken, refreshToken, profile, done) {
    const email = profile.emails ? profile.emails[0].value : null;
    const displayName = profile.displayName;
    const facebookId = profile.id;
    try {
        // Check if the user already exists in the database
        let user = await User.findOne({ facebookId: facebookId });
        if (user) {
            // If the user exists, return the user object
            return done(null, user);
        } else {
            // If the user does not exist, create a new user
            user = await User.create({
                email: email,
                facebookId: facebookId,
                displayName: displayName
            });
            return done(null, user);
        }
    } catch (error) {
        return done(error, null);
    }
}));
router.get('/facebook-signup', passport.authenticate('facebook', {scope:'email'}));
// Callback route after Facebook Sign-In
router.get('/auth/facebook/callback', 
  passport.authenticate('facebook', {
    successRedirect: '/user/profile',
    failureRedirect: '/failed'
  })
);


module.exports = router;