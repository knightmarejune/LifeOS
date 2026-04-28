const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.uid }).sort({ createdAt: 1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a habit
router.post('/', async (req, res) => {
  const habit = new Habit({
    userId: req.user.uid,
    name: req.body.name,
    emoji: req.body.emoji,
    color: req.body.color,
    history: req.body.history || {},
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a habit (toggle day)
router.patch('/:id', async (req, res) => {
  try {
    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      req.body,
      { new: true }
    );
    if (!updatedHabit) return res.status(404).json({ message: 'Habit not found' });
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const result = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!result) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
