const express = require('express')
const router = express.Router()

const messageController = require('../controllers/messageController.js')
const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')

router.route('/')
  .post(messageController.createMessage)
  .get(messageController.getAllMessages)

router.get('/conversation/:conversationId', messageController.getConversationMessages)

router.route('/:id')
  .get(messageController.getMessage)
  .patch(messageController.updateMessage)
  .delete(messageController.deleteMessage)

module.exports = router