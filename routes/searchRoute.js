const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/searchUsers", async (req, res) => {
  try {
    const query = req.query.query.toLowerCase();
    const results = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } }, // Case-insensitive match for first name
        { lastName: { $regex: query, $options: "i" } }, // Case-insensitive match for last name
        { email: { $regex: query, $options: "i" } }, // Case-insensitive match for email
        { about: { $regex: query, $options: "i" } },
      ],
    });
    res.render("./user_pages/searchResultsPage", { results });
  } catch (error) {
    // Handle any errors that occur during the search
    console.error("Error occurred during search:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/filterUsers", async (req, res) => {
  try {
    const { location, shortlisted, liked, industry, badges, recentlyUploaded } =
      req.body;
    let query = {};
    let sort = {};

   
    if (location) {
      query.location = location;
    }

   
    if (shortlisted === "mostShortlisted") {
      sort.savedcount = -1; 
    } else if (shortlisted === "leastShortlisted") {
      sort.savedcount = 1; 
    }

    
    if (liked === "mostLiked") {
      sort.likescount = -1; 
    } else if (liked === "leastLiked") {
      sort.likescount = 1; 
    }

    
    if (industry && industry.length > 0) {
      query.industry = { $in: industry };
    }

    if (badges && badges.length > 0) {
      query.badges = { $in: badges };
    }

   
    const now = new Date();
    if (recentlyUploaded === "24hours") {
      const pastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      query.videoCreatedAt = { $gte: pastDay }; 
    } else if (recentlyUploaded === "week") {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.videoCreatedAt = { $gte: pastWeek };
    } else if (recentlyUploaded === "month") {
      const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query.videoCreatedAt = { $gte: pastMonth };
    }

    const results = await User.find(query).sort(sort).lean();

    res.render("./user_pages/searchResultsPage", { results , userId: req.user._id });
  } catch (error) {
    console.error("Error filtering users:", error);
    res.status(500).send("Server error");
  }
});

router.get("/sd", async (req, res) => {
  res.render("./testing/sd");
});
module.exports = router;
