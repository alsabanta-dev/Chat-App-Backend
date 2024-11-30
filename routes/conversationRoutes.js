const express = require('express')
const router = express.Router()

const conversationController = require('../controllers/conversationController.js')
const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')

router.route('/')
  .post(conversationController.createConversation)
  .get(conversationController.getAllConversations)

router.get('/user/:userId', conversationController.getUserConversations)

router.post('/uploadFile', authController.protect, conversationController.uploadFile, conversationController.fileUpload)

router.route('/:id')
  .get(conversationController.getConversation)
  .patch(conversationController.updateConversation)
  .delete(conversationController.deleteConversation)

module.exports = router