const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const passport = require("passport");

const User = mongoose.model("User");
const Organization = mongoose.model("Organization");
const Message = require("../models/messages");

const wrapAsync = require("../utils/Wrapasync");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });
const cloudinary = require("cloudinary").v2;

const { isLoggedIn } = require("../middleware/userLoginCheck");

router.get("/user/signup", (req, res) => {
  res.render("./user_pages/userSignup", { user: req.user });
});

router.get("/user/viewProfile/:userId?", isLoggedIn, async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const recipientId = userId;
    const profileUser = await User.findById(userId).lean();

    if (!profileUser) {
      req.flash("error", "User not found.");
      return res.redirect("/feed");
    }

    // Check if profile is private and the current user is not the profile owner
    if (
      profileUser.isPrivate &&
      req.user._id.toString() !== userId.toString()
    ) {
      req.flash("error", "This profile is private.");
      return res.redirect("/feed");
    }

    // Modify the user object based on privacy settings if the viewer is not the profile owner
    if (req.user._id.toString() !== userId.toString()) {
      if (profileUser.hideLocation) {
        profileUser.location = "Hidden"; // Or whatever you prefer to display
      }

      if (profileUser.hideLikesAndSaved) {
        profileUser.likescount = "Hidden";
        profileUser.savedcount = "Hidden";
      }
    }

    const fields = [
      "email",
      "firstName",
      "lastName",
      "location",
      "skills",
      "industry",
      "about",
      "profilePicture",
      "video",
    ];
    let filledFieldsCount = fields.filter((field) => profileUser[field]).length;

    // Calculate completion percentage
    const completionPercentage = Math.round(
      (filledFieldsCount / fields.length) * 100
    );

    let badges = [];
    if (completionPercentage === 100) {
      badges.push("Completed Profile");
    }
    // Calculate total engagement
    const totalEngagement = profileUser.likescount + profileUser.savedcount;
    let progressPercent = 0;

    if (totalEngagement >= 100) {
      progressPercent = 100;
    } else if (totalEngagement >= 50) {
      progressPercent = 75;
    } else if (totalEngagement >= 10) {
      progressPercent = 30;
    } else if (totalEngagement > 0) {
      progressPercent = 10;
    }

    if (totalEngagement > 50) {
      badges.push("Most Wanted");
    }
    if (badges.length > 0) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { badges: badges } },
        { new: true }
      );
    }
    res.render("./user_pages/viewProfile", {
      progressPercent,
      user: profileUser,
      currentUser: req.user,
      completionPercentage,
      userId: req.user._id,
      organization: req.user,
      recipientId

    });
  } catch (error) {
    console.error("Error accessing profile:", error);
    req.flash("error", "Error accessing profile.");
    res.redirect("/feed");
  }
});

router.get("/user/settings", (req, res) => {
  res.render("./user_pages/settings", { userId: req.user._id, user: req.user });
});

router.get("/user/updateProfile", (req, res) => {
  res.render("./user_pages/updateProfile", { user: req.user });
});
router.get("/user/login", (req, res) => {
  res.render("./user_pages/userLogin", { user: req.user });
});

// router.get("/notifications", (req, res) => {
//   res.render("./user_pages/notifications", { user: req.user });
// });

router.post(
  "/user/login",
  passport.authenticate(["user", "organization"], {
    failureRedirect: "/user/login",
    failureFlash: { type: "error", message: "Invalid Username/Password" },
  }),
  async (req, res) => {
    const loggedInUser = req.user;

    if (loggedInUser instanceof User) {
      try {
        
        const userProfileFields = ['firstName', 'lastName', 'location', 'industry', 'skills', 'about', 'profilePicture', 'video'];
        const isUserProfileFilled = userProfileFields.some(field => loggedInUser[field]);
        if (isUserProfileFilled) {
          res.redirect(`/user/viewProfile/${loggedInUser._id}`);
        } else {
          res.redirect("/user/profile");
        }
      } catch (error) {
        console.error("Error during user login process:", error);
        res.status(500).send("Server error");
      }
    } else if (loggedInUser instanceof Organization) {
      try {
        const orgProfileFields = ['profilePicture', 'orgName', 'location', 'industry', 'orgSize', 'about'];
        const isOrgProfileFilled = orgProfileFields.some(field => loggedInUser[field]);

        if (isOrgProfileFilled) {
          res.redirect("/feed");
        } else {
          res.redirect("/organization/profile");
        }
      } catch (error) {
        console.error("Error during organization login process:", error);
        res.status(500).send("Server error");
      }
    } else {
      res.redirect("/");
    }
  }
);


// User Profile Route
router.get("/user/profile", isLoggedIn, async (req, res) => {
  res.render("./user_pages/userProfile", { user: req.user });
});

router.post(
  "/user/profile",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.user._id;

      const { firstName, lastName, location, industry, about } = req.body;

      const skills = Object.keys(req.body)
        .filter((key) => key.startsWith("skills"))
        .map((key) => req.body[key]);

      const updateFields = {
        firstName,
        lastName,
        location,
        industry,
        skills,
        about,
      };

      // Handle profile picture upload to Cloudinary
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        updateFields.profilePicture = result.secure_url;
      }

      // Update the User model
      await User.findByIdAndUpdate(userId, updateFields);

      req.flash("success", "Profile updated successfully");
      res.redirect("/recordvideo");
    } catch (error) {
      console.error("Error updating profile:", error);
      req.flash("error", "Error updating profile");
      res.redirect("/user/profile");
    }
  }
);

// Handling the new user request
router.post(
  "/usersignup",
  wrapAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      // Setup flash and call it here
      req.flash(
        "error",
        "Email already in use. Try a different email or log in instead."
      );
      return res.redirect("/user/signup");
    }

    const user = new User({ ...req.body });
    const registeredUser = await User.register(
      user,
      password,
      function (err, newUser) {
        if (err) {
          next(err);
        }
        req.logIn(newUser, () => {
          res.redirect("/user/login");
        });
      }
    );
  })
);

router.get("/user/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
