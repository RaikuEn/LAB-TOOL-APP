const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will hash this!
  role: { type: String, default: 'user' }, // New: 'admin' or 'user'
  fullName: { type: String, required: true },
  indexNumber: { type: String, required: true, unique: true }, // Different from MongoDB _id
  email: { type: String, required: true, unique: true },
  className: { type: String, required: true } // "Class" is a reserved word in JS, so use "className"
});
module.exports = mongoose.model('User', UserSchema);