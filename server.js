require('dotenv').config();
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import and use the API routes
const createCheckoutSession = require('./api/create-checkout-session');
app.use('/api/create-checkout-session', createCheckoutSession);

// Redirect routes without file extensions to the correct HTML files
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'public', `${page}.html`);
  
  res.sendFile(filePath, err => {
    if (err) {
      next();
    }
  });
});

// Fallback to index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
