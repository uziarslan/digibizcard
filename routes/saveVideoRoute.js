const express = require("express");
const router = express.Router();
const User = require('../models/user');
const cloudinary = require("cloudinary").v2;
const { isLoggedIn } = require('../middleware/userLoginCheck');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Set up disk storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination directory for uploaded files
    const uploadDir = 'videos/';
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Set the file name, appending the date to avoid name conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/recordvideo', isLoggedIn, async (req, res) => {
    res.render('./user_pages/createVideoPage', { user: req.user });
  });
  router.get('/video-success', async (req, res) => {
    res.render('./user_pages/successPageVideo', { user: req.user });
  });
  router.get("/uploadVideo", (req, res) => {
    res.render("./user_pages/uploadVideo", { user: req.user });
  });
  router.get("/uploadVideoSuccess", (req, res) => {
    res.render("./user_pages/uploadVideoSucess", { user: req.user });
  });

router.post('/save-video', isLoggedIn, upload.single('video'), async (req, res) => {
    try {
        const userId = req.user._id;
        console.log("Req File DATA: ", req.file);
        if (!req.file) {
            req.flash('error', 'No video data provided');
            return res.redirect('/user/profile');
        }

        const videoPath = req.file.path;

        cloudinary.uploader.upload(videoPath, { resource_type: 'video' }, async (error, result) => {
            if (error) {
                console.error('Error uploading video to Cloudinary:', error);
                req.flash('error', 'Error uploading video to Cloudinary');
                return res.redirect('/user/profile');
            }

            // Update user with the Cloudinary video URL
            await User.findByIdAndUpdate(userId, { 
              video: result.secure_url, 
              videoCreatedAt: new Date() // This line updates the videoCreatedAt field with the current date and time
            });

            // Delete the local video file after successful Cloudinary upload
            fs.unlink(videoPath, (err) => {
                if (err) {
                    console.error('Error deleting video from local storage:', err);
                }
            });

            req.flash('success', 'Video uploaded successfully');
            return res.redirect('/video-success');
        });
    } catch (error) {
        console.error('Error handling video upload:', error);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/user/profile');
    }
});

module.exports = router;
