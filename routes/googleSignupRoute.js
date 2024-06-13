const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const userEmail = profile.emails[0].value;
        console.log("User Email:", userEmail);

        const existingUser = await User.findOne({ email: userEmail });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          email: userEmail,
        });

        const savedUser = await newUser.save();

        return done(null, savedUser);
      } catch (error) {
        console.error("Error during Google signup:", error);
        return done(error, null);
      }
    }
  )
);
router.get(
  "/google-signup",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// Callback route after Google Sign-In
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect to the profile page or dashboard
    res.redirect("/user/profile");
  }
);
module.exports = router;
