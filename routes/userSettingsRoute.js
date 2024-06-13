const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { isLoggedIn } = require('../middleware/userLoginCheck');

// Private Account
router.post("/user/togglePrivacy", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const { isPrivate } = req.body;

    const user = await User.findById(userId);
    user.isPrivate = isPrivate;
    await user.save();

    res.status(200).send({ message: "Privacy setting updated." });
  } catch (error) {
    res.status(500).send({ message: "Error updating privacy setting." });
  }
});


// Hide likes and saved count
router.post("/user/settings/hideLikesAndSaved", isLoggedIn, async (req, res) => {
    try {
      const userId = req.user._id;
      // Since you're sending a boolean directly, ensure it is correctly interpreted from the request body
      const hideLikesAndSaved = req.body.hideLikesAndSaved === 'true' || req.body.hideLikesAndSaved === true;
  
      const user = await User.findById(userId);
      user.hideLikesAndSaved = hideLikesAndSaved;
      await user.save();
  
      res.status(200).send({ message: "Preferences updated successfully." });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).send({ message: "Internal server error." });
    }
  });
  
  // Hide Location
router.post("/user/settings/hideLocation", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    // Interpret the boolean value correctly from the request body
    const hideLocation = req.body.hideLocation === 'true' || req.body.hideLocation === true;

    const user = await User.findById(userId);
    user.hideLocation = hideLocation;
    await user.save();

    res.status(200).send({ message: "Location visibility preference updated successfully." });
  } catch (error) {
    console.error("Error updating location visibility preference:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});



module.exports = router;
