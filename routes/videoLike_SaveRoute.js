const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Organization = mongoose.model("Organization");
const Notification = mongoose.model("Notification");
const { isLoggedIn } = require("../middleware/userLoginCheck");
const Mailjet = require("node-mailjet");
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// Route to like a user profile
router.post("/organization/like/:userId", isLoggedIn, async (req, res) => {
  try {
    const organizationId = req.user._id;
    const userId = req.params.userId;

    const organization = await Organization.findById(organizationId).populate(
      "likedUsers"
    );
    // if (
    //   organization.likedUsers.find((user) => user._id.toString() === userId)
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "You have already liked this user's profile" });
    // }

    const user = await User.findById(userId);
    user.likescount++;
    await user.save();

    organization.likedUsers.push(userId);
    await organization.save();

    // Check if we have a socket for the liked user

    if (req.userSockets && req.userSockets[userId]) {
      // Iterate over each socket associated with the userId and emit the notification
      req.userSockets[userId].forEach((socket) => {
        socket.emit("notification", {
          message: `Your profile was liked by ${organization.orgName}!`,
          date: new Date(),
        });
      });
    }

    const notification = new Notification({
      userId: userId,
      message: `Your profile has been liked by ${organization.orgName}.`,
    });
    await notification.save();
    if (user.isLikedNotificationEnabled) {
      const emailRequest = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "hired2@quantomex.com",
              Name: "Hireddd",
            },
            To: [
              {
                Email: user.email, // Assuming 'email' field exists on User model
              },
            ],
            Subject: "Your Profile Has Been Liked!",
            HTMLPart: `
              <h3>Congratulations!</h3>
              <p>Your profile has caught the attention of <strong>${organization.orgName}</strong> and they have liked your profile on Hireddd.</p>
              <p>This could be the beginning of a great opportunity. Make sure to check out their profile and see what positions they are offering.</p>
              <p>Best of luck,</p>
              <p>The Hireddd Team</p>
            `,
          },
        ],
      });

      await emailRequest;
    }

    res.status(200).json({ likesCount: user.likescount });
  } catch (error) {
    console.error("Error liking user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to save a user profile
router.post("/organization/save/:userId", isLoggedIn, async (req, res) => {
  try {
    const organizationId = req.user._id;
    const userId = req.params.userId;

    const organization = await Organization.findById(organizationId).populate(
      "savedUsers"
    );
    if (
      organization.savedUsers.find((user) => user._id.toString() === userId)
    ) {
      return res
        .status(400)
        .json({ message: "You have already saved this user's profile" });
    }

    const user = await User.findById(userId);
    user.savedcount++;
    await user.save();

    organization.savedUsers.push(userId);
    await organization.save();

    // Check if we have a socket for the liked user

    if (req.userSockets && req.userSockets[userId]) {
      // Iterate over each socket associated with the userId and emit the notification
      req.userSockets[userId].forEach((socket) => {
        socket.emit("notification", {
          message: `Your profile was shortlisted by ${organization.orgName}!`,
          date: new Date(),
        });
      });
    }

    const notification = new Notification({
      userId: userId,
      message: `Your profile has been shortlisted by ${organization.orgName}.`,
    });
    await notification.save();

    // Send an email notification to the user
    const emailRequest = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "hired2@quantomex.com",
            Name: "Hireddd",
          },
          To: [
            {
              Email: user.email, 
            },
          ],
          Subject: "Your Profile Has Been Saved!",
          HTMLPart: `
              <h3>Great News!</h3>
              <p>Your profile has been saved by <strong>${organization.orgName}</strong> on Hireddd. This means they are interested in your skills and might contact you for potential opportunities.</p>
              <p>Stay tuned for more updates and make sure your profile is up-to-date.</p>
              <p>Best wishes,</p>
              <p>The Hireddd Team</p>
            `,
        },
      ],
    });

    await emailRequest;

    res.status(200).json({ savedCount: user.savedcount });
  } catch (error) {
    console.error("Error saving user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to set liked notification on and off
router.post(
  "/user/settings/toggleLikedNotification",
  isLoggedIn,
  async (req, res) => {
    try {
      const userId = req.user._id;
      // Since you're sending a boolean directly, ensure it is correctly interpreted from the request body
      const isLikedNotificationEnabled =
        req.body.isLikedNotificationEnabled === "true" ||
        req.body.isLikedNotificationEnabled === true;

      const user = await User.findById(userId);
      user.isLikedNotificationEnabled = isLikedNotificationEnabled;
      await user.save();

      res
        .status(200)
        .send({ message: "Liked notification setting updated successfully." });
    } catch (error) {
      console.error("Error updating liked notification setting:", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

// Route to set shortlisted notification on and off
router.post(
  "/user/settings/toggleShortlistedNotification",
  isLoggedIn,
  async (req, res) => {
    try {
      const userId = req.user._id;
      // Since you're sending a boolean directly, ensure it is correctly interpreted from the request body
      const isShortlistedNotificationEnabled =
        req.body.isShortlistedNotificationEnabled === "true" ||
        req.body.isShortlistedNotificationEnabled === true;

      const user = await User.findById(userId);
      user.isShortlistedNotificationEnabled = isShortlistedNotificationEnabled;
      await user.save();

      res.status(200).send({
        message: "Shortlisted notification setting updated successfully.",
      });
    } catch (error) {
      console.error("Error updating shortlisted notification setting:", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

module.exports = router;
