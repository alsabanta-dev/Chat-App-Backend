const multer = require('multer')
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");


exports.createConversation = catchAsync(async (req, res, next) => {
  const parties = req.body.parties
  if(!parties) return next(new AppError('Parties is required', 400))
  if(parties.length < 2) return next(new AppError('Conversation must contains atleast 2 parties', 400))
  
  let conversation = await Conversation.find({parties: {'$all': parties}}).populate('parties')
  if(conversation && conversation.length > 0){
    return res.status(200).json({
      status: 'success',
      message: 'Conversation with same parties is already exists',
      conversation: conversation[0]
    })
  }

  conversation = await Conversation.create(req.body).then((conversation)=> conversation.populate('parties'))
  res.status(200).json({
    status: 'success',
    message: 'Conversation created successfully',
    conversation
  })
})

exports.getAllConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find()
  res.status(200).json({
    status: 'success',
    results: conversations.length,
    conversations
  }) 
})

exports.getConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id)
  if(!conversation) return next(new AppError('There is no conversation with provided id', 400))

  res.status(200).json({
    status: 'success',
    conversation
  })
})

exports.updateConversation = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'This is conversation update endpoint'
  })
})

exports.deleteConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findByIdAndDelete(req.params.id)
  if(!conversation) return next(new AppError('There is no conversation with provided id', 400))
  
  res.status(200).json({
    status: 'success',
    message: 'Conversation deleted successfully'
  })
  
})

exports.getUserConversations = catchAsync(async (req, res, next) => {
  let conversations = await Conversation.find({parties: {'$in': [req.params.userId]}, latestMessage:{'$ne': null}}).sort('-updatedAt').populate('parties').populate('latestMessage')
  res.status(200).json({
    status: 'success',
    results: conversations.length,
    conversations
  }) 
})

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = getFileFolder(file) 
    
    cb(null, `public/storage/conversations/${folderName}`)
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]
    cb(null, `${req.user.id}-${Date.now()}.${ext}`)
  }
})

const getFileType = (file) => {
  switch(file.mimetype.split('/')[0]){
    case 'image': return 'image';;
    case 'video': return 'video';
    default: return 'document';
  }
}

const getFileFolder = (file) => {
  switch(getFileType(file)){
    case 'image': return 'images';
    case 'video': return 'videos';
    default: return 'documents';
  }
}

const upload = multer({
  storage: multerStorage,
})


exports.uploadFile = upload.single('file')

exports.fileUpload = catchAsync(async (req, res, next) => {
  if(!req.file) return next(new AppError('Something went wrong while uploading, try again later', 400))
  
  res.status(200).json({
    status: 'success',
    file: {
      name: req.file.filename,
      type: getFileType(req.file)
    }
  }) 
})

exports.setNewMessagesCount = catchAsync(async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId).populate('latestMessage')
  if(conversation.latestMessage && conversation.latestMessage.sender != userId && conversation.newMessagesCount > 0){
    conversation.newMessagesCount = 0
    await conversation.save()
  }
})

exports.conversation = conversationId => {
  return Conversation.findById(conversationId)
}