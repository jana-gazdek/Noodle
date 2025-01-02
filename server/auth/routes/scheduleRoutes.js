const express = require('express');
const router = express.Router();
const sendEmailNotification = require('../utils/emailNotification');

router.post('/notify-all-students', async (req, res) => {
  try {
    const results = await sendEmailNotification();
    res.json({
      message: 'Email notifications completed',
      successes: results.successes,
      failures: results.failures
    })
  } catch (err) {
    console.error('Error sending notifications:', err);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

module.exports = router;