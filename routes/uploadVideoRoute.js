const express = require("express");
const router = express.Router();
const User = require('../models/user');
const cloudinary = require("cloudinary").v2;
const { isLoggedIn } = require('../middleware/userLoginCheck');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const userFirstName = req.user.firstName || 'defaultFirstName'; 
    const userLastName = req.user.lastName || 'defaultLastName'; 

    const fileName = `${userFirstName}_${userLastName}_video${Date.now()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });


// POST route to handle video upload
router.post("/upload-video", isLoggedIn, upload.single("video"), async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      req.flash("error", "No video file provided");
      return res.redirect("/user/profile");
    }
    const filePath = req.file.path;
    try {
      const result = await cloudinary.uploader.upload(filePath, { resource_type: 'video' });
      // Update user with the Cloudinary video URL
      await User.findByIdAndUpdate(userId, { 
        video: result.secure_url, 
        videoCreatedAt: new Date() // This line updates the videoCreatedAt field with the current date and time
      });
      req.flash("success", "Video uploaded successfully");
      fs.unlinkSync(filePath);
      return res.redirect('/uploadVideoSuccess');
    } catch (cloudinaryError) {
      console.error("Error uploading video to Cloudinary:", cloudinaryError);
      req.flash("error", "Error uploading video to Cloudinary");
      return res.redirect("/user/profile");
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    req.flash("error", "Internal Server Error");
    return res.redirect("/user/profile");
  }
});



module.exports = router;
