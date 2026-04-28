const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all journal entries
router.get('/', async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user.uid }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a journal entry
router.post('/', async (req, res) => {
  const entry = new Journal({
    userId: req.user.uid,
    date: req.body.date,
    thought: req.body.thought,
    wentWell: req.body.wentWell,
    wasted: req.body.wasted,
    mood: req.body.mood,
  });

  try {
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a journal entry
router.patch('/:id', async (req, res) => {
  try {
    const updatedEntry = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      req.body,
      { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json(updatedEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a journal entry
router.delete('/:id', async (req, res) => {
  try {
    const result = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!result) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
