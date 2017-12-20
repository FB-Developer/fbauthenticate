const mongoose = require('mongoose');
const bcrypt =require('bcrypt');

var userSchema= mongoose.Schema({
    userId:{type:String,unique:true},
    password:String,
    userRole:String,
    userName:String,
    facultydetail:{
        dept:String
    },
    studentdetail:{
      academicyear:String,
      degree:String,
      dept:String,
      sem:String,
      class:String,
      batch:String,
      completed:Boolean
    }
    // userRole: {
    //   type: String,
    //   enum: ['admin', 'faculty', 'student' ,'principal'],
    //   default: 'student'
    // },
  });
userSchema.pre('save', function (next) {
    const users = this,
    SALT_FACTOR = 5;
    if (!users.isModified('password')){
       return next();
     }
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
      if (err)
        return next(err);
      bcrypt.hash(users.password, salt, (err, hash) => {
        if (err)
          return next(err);
        users.password = hash;
        next();
      });
    });
});
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) { return cb(err); }
      cb(null, isMatch);
    });
};
module.exports=mongoose.model('user',userSchema);
