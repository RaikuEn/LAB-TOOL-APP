const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Digital Multimeter"
  category: { type: String, default: 'General' }, // e.g., "Electronics"
  isAvailable: { type: Boolean, default: true }, // To track if it's in the lab or lent out
  borrowerName: { type: String, default: '' }, // Who has it?
  dueDate: { type: Date } // When should it come back?
});

module.exports = mongoose.model('Tool', ToolSchema);