const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = Schema({
  name: {
    type: String,
    require : true
  },
  email: {
    type: String,
    unique: true,
    require : true
  },
  user_name: {
    type: String,
    unique: true,
    require: true
  },
  password: {
    type: String,
    unique: true,
    require: true
  }
}, { strict: false })

module.exports = mongoose.model('user', userSchema);