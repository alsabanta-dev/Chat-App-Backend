const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'User name is required'],
    unique: [true, 'There are another user with the same user name'],
    validate: {
      validator: (el) => {
        return !(el.includes(' ') || el.includes('*') || el.includes('-') || el.includes('+') || el.includes('/') || el.includes('^') || el.includes('%') || el.includes('$') || el.includes('&') || el.includes('|')) 
      },
      message: "User name must not have any spaces or those special letters (*,-,+,/,^,%,$,&,|)"
    }
  },
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  password: {
    type: String,
    required: [true, 'Password is reqyured'],
    select: false
  },
  photo: {
    type: String,
    default: 'default.jpg'
  }
}, 
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
})

userSchema.virtual('name').get(function(){
  return `${this.firstName} ${this.lastName}`
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}


userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires  = Date.now() + 10*60*1000

  console.log(resetToken, this.passwordResetToken)

  return resetToken
}

userSchema.set('timestamps', true);
const User = mongoose.model('User', userSchema)

module.exports = User