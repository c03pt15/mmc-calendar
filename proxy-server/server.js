const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'https://mmc-calendar.atlasveterans.ca',
    'https://mmc-calendar.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MMC Calendar Proxy Server is running' });
});

// Proxy configuration for Supabase
const supabaseProxy = createProxyMiddleware({
  target: process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/rest/v1'  // Rewrite /api to /rest/v1
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add any custom headers if needed
    console.log(`Proxying request: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Ensure CORS headers are present
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey, x-client-info, x-client-version';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    
    console.log(`Response status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error occurred' });
  }
});

// Apply proxy to all /api routes
app.use('/api', supabaseProxy);

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, apikey, x-client-info, x-client-version');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 MMC Calendar Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxying Supabase requests from /api to ${process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
