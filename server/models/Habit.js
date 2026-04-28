const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  emoji: { type: String },
  color: { type: String },
  history: { type: Map, of: Boolean, default: {} },
  createdAt: { type: Number, default: Date.now },
});

module.exports = mongoose.model('Habit', HabitSchema);
