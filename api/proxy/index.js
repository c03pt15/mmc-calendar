const { createProxyMiddleware } = require('http-proxy-middleware');

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, apikey, x-client-info, x-client-version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Create proxy middleware
  const proxy = createProxyMiddleware({
    target: process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co',
    changeOrigin: true,
    pathRewrite: {
      '^/api/proxy': '/rest/v1'  // Rewrite /api/proxy to /rest/v1
    },
    onProxyReq: (proxyReq, req, res) => {
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

  // Execute the proxy
  proxy(req, res);
}
