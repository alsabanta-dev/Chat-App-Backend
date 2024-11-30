const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/isLoggedIn', authController.isLoggedIn)
router.get('/logout', authController.logout)

router.patch('/updateMe', authController.protect, userController.uploadUserPhoto, userController.updateMe)
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

router.route('/')
  .post(userController.createUser)
  .get(userController.getAllUsers)

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router