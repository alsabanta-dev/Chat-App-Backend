const Conversation = require("../models/conversationModel")
const Message = require("../models/messageModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const conversationController = require("./conversationController")

module.exports.addMessage = catchAsync (async (message) => {
  const newMessage = await Message.create({
    message: message.message,
    conversation: message.conversation,
    sender: message.sender,
    file: message.file,
    type: message.type,
  })

  const conversation = await Conversation.findById(message.conversation)
  conversation.latestMessage = newMessage.id
  conversation.newMessagesCount += 1
  await conversation.save()
})

module.exports.createMessage = catchAsync(async (req, res, next) => {
  const message = await Message.create({
    message: req.body.message,
    conversation: req.body.conversation,
    sender: req.body.sender,
    type: req.body.type,
    file: req.body.file,
  })

  res.status(200).json({
    status: 'success',
    message: 'Message created successfully'
  })
})

module.exports.getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find()

  res.status(200).json({
    status: 'success',
    results: messages.length,
    messages
  })

})

module.exports.getConversationMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({conversation: req.params.conversationId}).sort({createdAt: 'desc'})

  res.status(200).json({
    status: 'success',
    results: messages.length,
    messages
  })
})

module.exports.getMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
  
  if(!message) return next(new AppError('No message found with provided id', 400))

  res.status(200).json({
    status: 'success',
    message
  })
})

module.exports.updateMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body)
  
  if(!message) return next(new AppError('No message found with provided id', 400))
  
  res.status(200).json({
    status: 'success',
    message: 'message updated successfully',
    message
  })
})
module.exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndDelete(req.params.id)
  
  if(!message) return next(new AppError('No message found with provided id', 400))
  
  res.status(200).json({
    status: 'success',
    message: 'message deleted successfully'
  })
})