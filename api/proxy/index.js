export default async function handler(req, res) {
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

  // Health check endpoint
  if (req.url === '/api/proxy/health' || req.url === '/api/proxy') {
    res.status(200).json({ 
      status: 'OK', 
      message: 'MMC Calendar Proxy is running',
      supabaseUrl: process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co'
    });
    return;
  }

  try {
    // Extract the path after /api/proxy/
    const path = req.url.replace('/api/proxy', '');
    const targetUrl = `${process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co'}/rest/v1${path}`;
    
    console.log(`Proxying ${req.method} request to: ${targetUrl}`);

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
      message: error.message 
    });
  }
}
