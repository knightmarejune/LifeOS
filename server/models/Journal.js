const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  thought: { type: String },
  wentWell: { type: String },
  wasted: { type: String },
  mood: { type: Number, min: 1, max: 5 },
  createdAt: { type: Number, default: Date.now },
});

module.exports = mongoose.model('Journal', JournalSchema);
