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
    const newTrades = req.body; 
    if (!Array.isArray(newTrades)) {
      return res.status(400).json({ message: 'Payload must be an array of trades' });
    }

    // Fetch existing trades to prevent duplicates
    const existingTrades = await Trade.find({});
    // Create a heuristic key for each trade: Date + Pair + Direction + EntryPrice
    const existingKeys = new Set(existingTrades.map(t => `${t.date}|${t.pair}|${t.direction}|${t.entry}`));
    
    const uniqueNewTrades = newTrades.filter(t => !existingKeys.has(`${t.date}|${t.pair}|${t.direction}|${t.entry}`));

    let insertedCount = 0;
    if (uniqueNewTrades.length > 0) {
      const inserted = await Trade.insertMany(uniqueNewTrades);
      insertedCount = inserted.length;
    }

    res.status(200).json({ 
      message: 'Trades processed successfully', 
      inserted: insertedCount,
      duplicatesIgnored: newTrades.length - insertedCount
    });
  } catch (error) {
    console.error('Error in uploadTrades:', error);
    res.status(500).json({ message: 'Server Error uploading trades', error: String(error) });
  }
};
