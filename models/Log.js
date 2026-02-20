const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  toolName: String,
  borrowerName: String,
  action: String, // "Borrowed" or "Returned"
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);
