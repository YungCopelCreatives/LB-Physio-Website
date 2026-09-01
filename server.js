const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Security and utility headers - prevent stale browser caching
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Middleware for parsing form bodies and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handle contact and consultation form submissions
app.all(['/mail/mail.php', '/mail.php', '/api/contact', '/api/consultation'], (req, res) => {
  if (req.method === 'POST') {
    const { name, email, phone, subject, message } = req.body;
    console.log('[Form Submission Received]', {
      timestamp: new Date().toISOString(),
      name: name || 'Not specified',
      email: email || 'Not specified',
      phone: phone || 'Not specified',
      subject: subject || 'Consultation Request',
      message: message || 'No message provided'
    });
    return res.redirect('/mail-success.html');
  }
  return res.redirect('/contact.html');
});

// Serve static files with html extension fallback and no-cache
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm'],
  index: 'index.html',
  maxAge: 0,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Fallback for any 404 routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`LB Physiotherapy server running at http://${HOST}:${PORT}`);
});

