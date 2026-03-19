const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simple demo backend auth 
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  // In a real app we would check a User DB and hash with bcrypt.
  // The user requested a "JWT or simple demo system".
  if (password.length >= 4) {
    const token = jwt.sign({ userId: 'demo123', email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    return res.status(200).json({ 
        token, 
        user: { id: 'demo123', email, name: email.split('@')[0] } 
    });
  }
  
  return res.status(401).json({ message: 'Invalid credentials. Password too short.' });
});

module.exports = router;
