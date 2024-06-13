const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },

    facebookId: String,
    displayName: String,
    resetPasswordOTP: String,
    firstName: String,
    lastName: String,
    location: String,
    industry: String,
    skills: [String],
    about: String,
    profilePicture: String,
    video: String,
    videoCreatedAt: Date,
    badges: [{ type: String }],
    likescount: {
      type: Number,
      default: 0,
    },
    savedcount: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "user",
    },
    isPrivate: { type: Boolean, default: false },
    hideLikesAndSaved: { type: Boolean, default: false },
    hideLocation: { type: Boolean, default: false },
    isLikedNotificationEnabled: { type: Boolean, default: true },
    isShortlistedNotificationEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);
// Indexes
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
// Use passportLocalMongoose and specify the username field as 'email'
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

module.exports = mongoose.model('User', userSchema);
