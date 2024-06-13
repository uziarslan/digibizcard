const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");

const Organization = mongoose.model("Organization");
const User = mongoose.model("User");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });
const cloudinary = require("cloudinary").v2;
const { isLoggedIn } = require("../middleware/userLoginCheck");

router.get("/organization/profile", async (req, res) => {
  res.render("./user_pages/organizationProfile", { organization: req.user });
});
router.get("/organization/viewProfile/:orgId?", isLoggedIn, async (req, res) => {
  let organizationData;
  
  // If an orgId is provided in the route parameters, use that to find the organization.
  // Otherwise, if the logged-in user is an organization, show their profile.
  if (req.params.orgId) {
    organizationData = await Organization.findById(req.params.orgId);
    if (!organizationData) {
      // Handle the case where the organization is not found
      return res.status(404).send('Organization not found');
    }
  } else if (req.user && req.user.role === 'organization') {
    organizationData = req.user;
  } else {
    // If there is no orgId and the user is not an organization, redirect or show an error.
    return res.redirect('/'); // or show an error message
  }
  
  res.render("./user_pages/viewProfileCompany", { organization: organizationData });
});
router.get("/likedVideos", async (req, res) => {
  const organizationId = req.user._id;

  // Fetch the organization and populate the likedUsers array
  const organization = await Organization.findById(organizationId).populate(
    "likedUsers"
  );
  res.render("./user_pages/likedVideos", {
    organization: req.user,
    likedUsers: organization.likedUsers,
    userId: req.user._id,
  });
});
router.get("/savedVideos", async (req, res) => {
  try {
    const organizationId = req.user._id;

    // Fetch the organization and populate the savedUsers array
    const organization = await Organization.findById(organizationId).populate('savedUsers');

    // Render the "savedVideos" page with the organization and its saved users
    res.render("./user_pages/savedVideos", {userId: req.user._id, organization: req.user, savedUsers: organization.savedUsers });
  } catch (error) {
    console.error('Error fetching saved user profiles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post("/organization/signup", async (req, res, next) => {
  try {
    const { email, password, websiteUrl } = req.body;

    // Check if the organization email is already in use
    const existingOrganization = await Organization.findOne({ email });
    if (existingOrganization) {
      req.flash(
        "error",
        "Email already in use. Try a different email or log in instead."
      );
      return res.redirect("/user/signup");
    }

    const organization = new Organization({ email, websiteUrl });

    const org = await Organization.register(
      organization,
      password,
      function (err, newOrganization) {
        if (err) {
          next(err);
        }
        req.login(newOrganization, () => {
          res.redirect("/user/login");
        });
      }
    );
  } catch (error) {
    console.error("Error registering organization:", error);
    req.flash("error", "Error registering organization");
    res.redirect("/user/signup");
  }
});

// Organization Login Route
router.post(
  "/organization/login",
  passport.authenticate("organization", {
    failureRedirect: "/user/login",
    failureFlash: { type: "error", message: "Invalid Email/Password" },
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/organization/profile");
  }
);

router.post(
  "/organization/profile",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const orgId = req.user._id;

      const { profilePicture, orgName, location, industry, orgSize, about } =
        req.body;

      const updateFields = {
        profilePicture,
        orgName,
        location,
        industry,
        orgSize,
        about,
      };

      // Handle profile picture upload to Cloudinary
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        updateFields.profilePicture = result.secure_url;
      }

      // Update the Organization model
      await Organization.findByIdAndUpdate(orgId, updateFields);

      req.flash("success", "Organization profile updated successfully");
      res.redirect("/feed"); // Adjust the redirect URL as needed
    } catch (error) {
      console.error("Error updating organization profile:", error);
      req.flash("error", "Error updating organization profile");
      res.redirect("/organization/profile");
    }
  }
);

router.get("/organization/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


module.exports = router;
