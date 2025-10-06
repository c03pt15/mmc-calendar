export default async function handler(req, res) {
  console.log('=== SUPABASE PROXY DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('================================');

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

  // Health check
  if (req.url === '/api/supabase-proxy.js' || req.url.includes('health=true')) {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Supabase Proxy is running',
      supabaseUrl: process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co'
    });
    return;
  }

  try {
    // Get the path after /api/supabase-proxy.js
    let path = req.url.replace('/api/supabase-proxy.js', '');
    
    // If no path, default to /rest/v1/
    if (!path || path === '') {
      path = '/rest/v1/';
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    const targetUrl = `${process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co'}${path}`;
    
    console.log('Target URL:', targetUrl);

    // Forward the request to Supabase
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'apikey': req.headers.apikey || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'x-client-info': req.headers['x-client-info'] || '',
        'x-client-version': req.headers['x-client-version'] || '',
        ...req.headers
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response data
    const data = await response.text();
    
    // Set response headers
    res.status(response.status);
    
    // Copy important headers from Supabase response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('content-')) {
        res.setHeader(key, value);
      }
    });

    // Send the response
    res.send(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error occurred',
      message: error.message,
      stack: error.stack
    });
  }
}
