const mongoose = require('mongoose');

// Define a sub-schema for individual messages with timestamps
const messageSubSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  delivered: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false // Initially false, set to true when the message is read
  }
}, { timestamps: true }); // Enable timestamps for each message

// Define the main schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSubSchema] // Use the sub-schema for messages
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
