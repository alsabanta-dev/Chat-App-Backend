const multer = require('multer')

const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users')
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const multerFilter = (re, file, cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  }else{
    cb(new AppError('Not an image! Please, upload only images', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.createUser = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: "Welcome to create user endpoint"
  })
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let users = await User.find()
  if(!users) return next(new AppError('No users found', 400))

  if(req.query.search){
    const query = req.query.search.toLocaleLowerCase()
    users = users.filter(
      user => 
        user.userName.toLocaleLowerCase().startsWith(query) || 
        user.name.toLocaleLowerCase().startsWith(query) || 
        user.firstName.toLocaleLowerCase().startsWith(query) || 
        user.lastName.toLocaleLowerCase().startsWith(query)
    )
  }

  res.status(200).json({
    status: 'success',
    users
  })
})

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if(!user) return next(new AppError('No user found with provided id', 400))
  res.status(200).json({
    status: 'success',
    user
  })
})

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
  }, {new: true})

  if(!user) return next(new AppError('No users found', 400))
  
  res.status(200).json({
    status: 'success',
    message: "User updated successfully",
    data: {
      user
    }
  })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
  }
  if(req.file) data.photo = req.file.filename
  const user = await User.findByIdAndUpdate(req.user._id, data, {new: true})

  if(!user) return next(new AppError('No users found', 400))
  
  res.status(200).json({
    status: 'success',
    message: "User updated successfully",
    data: {
      user
    }
  })
})

exports.deleteUser = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: "Welcome to delete user endpoint" + req.params.id
  })
}

exports.signup = async (req, res, next) => {
  const userData = {
    userName: req.body.userName,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }
    

  if(!req.body.passwordConfirm) return res.status(400).json({
    status: 'fail',
    message: 'passwordConfirm is required'
  })

  if(userData.password != req.body.passwordConfirm) 
    return res.status(400).json({
      status: 'fail',
      message: 'Passwords are not the same'
    })

    try{
      console.log(userData)
      const user = await User.create(userData)
    
      res.status(200).json({
        status: 'success',
        message: "Signed up successfully",
        user: {
          user
        }
      })
    }catch(err){
      
      console.log(err.name)
      if(err.name == 'ValidationError'){
        const errors = Object.values(err.errors).map(el => el.message);

        const message = `Invalid input data: ${errors.join('. ')}`;
        return res.status(500).json({
          status: 'fail',
          message
        })
      }
      res.status(500).json({
        status: 'fail',
        message: "Something went wrong"
      })
    }
}

exports.login = async (req, res, next) => {
  
}