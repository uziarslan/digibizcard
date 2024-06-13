const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const organizationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resetPasswordOTP: String,
  profilePicture: String,
  websiteUrl: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'organization',
  },
  orgName: String,
  location: String,
  industry: String,
  orgSize: String,
  about: String,
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] ,
  savedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] ,
  recentChats: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    lastMessage: String,
    lastMessageTime: Date
  }]
});
organizationSchema.plugin(passportLocalMongoose, {
  usernameField: 'email', 
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
