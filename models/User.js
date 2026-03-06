const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will hash this!
  role: { type: String, default: 'user' } // New: 'admin' or 'user'
});
module.exports = mongoose.model('User', UserSchema);