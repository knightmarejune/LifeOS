const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  notes: { type: String },
  priority: { type: String, enum: ['must', 'should', 'optional'], default: 'should' },
  date: { type: String, required: true }, // ISO date yyyy-mm-dd
  completed: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now },
});

module.exports = mongoose.model('Task', TaskSchema);
