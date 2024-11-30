const mongoose = require('mongoose');
const Message = require('./messageModel');

const conversationSchema = new mongoose.Schema({
  parties: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  latestMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  newMessagesCount: {
    type: Number,
    default: 0
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})

conversationSchema.set('timestamps', true);
const Conversation = mongoose.model('Conversation', conversationSchema)

module.exports = Conversation