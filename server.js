const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Security and utility headers - prevent stale browser caching and enhance security
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=()');
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
    return res.redirect('/mail-success');
  }
  return res.redirect('/contact');
});

// Clean URLs enforcement middleware: 301 redirect any legacy .html requests to clean URLs
app.use((req, res, next) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const search = parsedUrl.search;

  // Redirect /index.html and /index to /
  if (pathname === '/index.html' || pathname === '/index') {
    return res.redirect(301, '/' + search);
  }

  // Redirect any request ending in .html to clean extensionless path
  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.slice(0, -5);
    return res.redirect(301, cleanPath + search);
  }

  // Strip trailing slashes on sub-paths (e.g. /services/ -> /services)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return res.redirect(301, pathname.slice(0, -1) + search);
  }

  // Case normalization for /FAQ -> /faq
  if (pathname === '/FAQ') {
    return res.redirect(301, '/faq' + search);
  }

  next();
});

// Explicit clean routes mapping
const cleanRoutes = {
  '/': 'index.html',
  '/about': 'about.html',
  '/services': 'services.html',
  '/portfolio-details': 'portfolio-details.html',
  '/recovery-stories': 'portfolio-details.html',
  '/contact': 'contact.html',
  '/appointment': 'appointment.html',
  '/processes': 'processes.html',
  '/faq': 'FAQ.html',
  '/privacy': 'privacy.html',
  '/terms': 'terms.html',
  '/mail-success': 'mail-success.html',
  '/404': '404.html'
};

Object.entries(cleanRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// Serve static assets with html extension fallback and no-cache
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm'],
  index: false,
  maxAge: 0,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Fallback for any 404 routes - serve dedicated branded 404 page with HTTP 404 status
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`LB Physiotherapy server running at http://${HOST}:${PORT}`);
});

