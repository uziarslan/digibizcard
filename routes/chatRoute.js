const express = require('express');
const router = express.Router();
const User = require("../models/user");
const Organization = require("../models/organization");
const { isLoggedIn } = require("../middleware/userLoginCheck");
router.get("/chat", isLoggedIn, async (req, res) => {
  try {
  
    res.render("./user_pages/chat", {
      userId: req.user._id, // The ID of the logged-in user or organization
    });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).send("Server error");
  }
});

router.get("/chat/:recipientId", isLoggedIn, async (req, res) => {
  const { recipientId } = req.params;
  const userIdAsString = req.user._id.toString();
  const recipientIdAsString = recipientId;
  
  try {

    res.render("./user_pages/chat", {
      userId: userIdAsString, // Now ensured to be a string
      recipientId: recipientIdAsString, // Ensured to be a string
    });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).send("Server error");
  }
});


router.get("/getUserDetails/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    let details;

    // Try to find the user in the User model
    const user = await User.findById(userId, 'firstName lastName profilePicture');
    if (user) {
      details = {
        name: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture || '/images/view1.png'
      };
    } else {
      // If not found, try to find the user in the Organization model
      const organization = await Organization.findById(userId, 'orgName profilePicture');
      if (organization) {
        details = {
          name: organization.orgName,
          profilePicture: organization.profilePicture || '/images/view1.png'
        };
      }
    }

    if (!details) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(details);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
