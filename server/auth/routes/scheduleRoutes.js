const express = require('express');
const router = express.Router();
const sendEmailNotificationSchedule = require('../utils/emailNotificationSchedule');

router.post('/notify-all-students', async (req, res) => {
  try {
    const results = await sendEmailNotificationSchedule();
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