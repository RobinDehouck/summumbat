const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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
