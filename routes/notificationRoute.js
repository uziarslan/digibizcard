const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/userLoginCheck");
const Notification = require("../models/notification");


router.get("/notifications/count", isLoggedIn, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      read: false,
    }).sort({ date: -1 });
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).send("Server error");
  }
});

router.post(
  "/notifications/mark-as-read/:notificationId",
  isLoggedIn,
  async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.notificationId, {
        read: true,
      });
      res.status(200).send("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
