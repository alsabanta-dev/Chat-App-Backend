const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    // required: [true, 'Message is required'],
  },
  date: {
    type: Number,
    default: Date.now()
  },
  conversation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation is required']
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  type: {
    type: String,
    enum: ['text', 'voice','image', 'video', 'document'],
    default: 'text'
  },
  file: String
})

messageSchema.pre('save', function(next){
  if(this.type && this.type != 'text'){
    if(!this.file){
      next(new AppError(`Message of type '${this.type}' must contains file`, 400))
    }
  }
  next()
})

messageSchema.set('timestamps', true);
const Message = mongoose.model('Message', messageSchema)

module.exports = Message