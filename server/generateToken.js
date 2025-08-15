const jwt = require('jsonwebtoken');

// Payload example, you can adjust this
const payload = { id: "userID123", name: "Riya" };

// Generate a token
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Generated Token:', token);
