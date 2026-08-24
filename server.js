const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware for parsing form bodies and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handle contact form submission endpoint
app.all(['/mail/mail.php', '/mail.php'], (req, res) => {
  if (req.method === 'POST') {
    const { name, email, phone, subject, message } = req.body;
    console.log('[Contact Form Submission]', { name, email, phone, subject, message });
    return res.redirect('/mail-success.html');
  }
  return res.redirect('/contact.html');
});

// Serve static files with html extension fallback
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Fallback to index.html for undefined routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`LB Physiotherapy server running at http://${HOST}:${PORT}`);
});
