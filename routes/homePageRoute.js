const express = require('express');
const router = express.Router();
const user = require('../models/user');
const { isLoggedIn } = require('../middleware/userLoginCheck');
const { isOrganization } = require('../middleware/organizationUserCheck');



router.get('/', async (req, res) => {
  res.render('./user_pages/index' , { user: req.user });
});

router.get('/feed', isOrganization, async (req, res) => {
  try {
   
    let feedData = await user.find({ isPrivate: { $ne: true } }).lean();

    feedData = feedData.map(user => {
      if (user.hideLikesAndSaved) {
        user.likescount = "Hidden";
        user.savedcount = "Hidden";
      }
      if (user.hideLocation) {
        user.location = "Hidden";
      }
      return user;
    });

    const orgData = req.user;
    const requiredFields = ['email', 'orgName', 'location', 'industry', 'orgSize', 'about'];
    let filledCount = 0;
    requiredFields.forEach(field => {
      if (orgData[field] && orgData[field].trim() !== '') {
        filledCount++;
      }
    });
    const completionPercentage = Math.round((filledCount / requiredFields.length) * 100);

    res.render('./user_pages/feed', { userId: req.user._id, feedData, organization: req.user, completionPercentage });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).send('Server error while fetching feed');
  }
});



router.get('/search', async (req, res) => {
  
  res.render('./user_pages/search', { user: req.user });
});
router.get('/slider', async (req, res) => {
  res.render('./user_pages/slider');
});

router.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = await user.findById(userId);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;