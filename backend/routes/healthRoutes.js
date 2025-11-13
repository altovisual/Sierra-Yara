const express = require('express');
const router = express.Router();

/**
 * @desc    Health check endpoint para keep-alive
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
