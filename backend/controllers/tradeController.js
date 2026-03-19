const Trade = require('../models/Trade');

exports.getTrades = async (req, res) => {
  try {
    const trades = await Trade.find().sort({ date: -1 }); // Sort by newest date
    res.json(trades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching trades' });
  }
};

exports.uploadTrades = async (req, res) => {
  try {
    // Delete all existing trades (global overwrite logic)
    await Trade.deleteMany({});
    
    // Insert new trades from CSV
    const newTrades = req.body; 
    if (!Array.isArray(newTrades)) {
      return res.status(400).json({ message: 'Payload must be an array of trades' });
    }

    const inserted = await Trade.insertMany(newTrades);
    res.status(200).json({ message: 'Trades uploaded successfully', count: inserted.length });
  } catch (error) {
    console.error('Error in uploadTrades:', error);
    res.status(500).json({ message: 'Server Error uploading trades', error: String(error) });
  }
};
