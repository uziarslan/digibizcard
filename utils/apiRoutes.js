const express = require('express');
const router = express.Router();
// Routes will go here
const adminRoutes = require("../routes/adminRoute");
const userRoutes = require("../routes/userRoute");
const homePageRoute = require("../routes/homePageRoute");
const organizationRoutes = require("../routes/organizationRoutes");
const passwordResetRoute = require("../routes/passwordResetRoute");
const googleSignupRoute = require("../routes/googleSignupRoute");
const facebookSignupRoute = require("../routes/facebookSignupRoute");
const videoRoute = require("../routes/uploadVideoRoute");
const saveVideoRoute = require("../routes/saveVideoRoute");
const searchRoute = require("../routes/searchRoute");
const chatRoute = require("../routes/chatRoute");
const userSettingsRoute = require("../routes/userSettingsRoute");
const videoLikeSaveRoute = require("../routes/videoLike_SaveRoute");
const notificationRoute = require("../routes/notificationRoute");

router.use(adminRoutes);
router.use(userRoutes);
router.use(homePageRoute);
router.use(organizationRoutes);
router.use(passwordResetRoute);
router.use(googleSignupRoute);
router.use(facebookSignupRoute);
router.use(videoRoute);
router.use(saveVideoRoute);
router.use(searchRoute);
router.use(chatRoute);
router.use(userSettingsRoute);
router.use(videoLikeSaveRoute);
router.use(notificationRoute);



module.exports = router;
