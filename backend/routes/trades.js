const express = require('express');
const router = express.Router();
const { getTrades, uploadTrades } = require('../controllers/tradeController');

router.get('/', getTrades);
router.post('/upload', uploadTrades);

module.exports = router;
