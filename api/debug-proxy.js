export default async function handler(req, res) {
  console.log('=== DEBUG PROXY ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

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

  // Test different path scenarios
  const scenarios = {
    originalUrl: req.url,
    pathAfterReplace: req.url.replace('/api/debug-proxy.js', ''),
    pathWithSlash: req.url.replace('/api/debug-proxy.js', '').startsWith('/') ? req.url.replace('/api/debug-proxy.js', '') : '/' + req.url.replace('/api/debug-proxy.js', ''),
    finalPath: (() => {
      let path = req.url.replace('/api/debug-proxy.js', '');
      if (!path || path === '') path = '/rest/v1/';
      if (!path.startsWith('/')) path = '/' + path;
      if (!path.startsWith('/rest/v1')) path = '/rest/v1' + path;
      return path;
    })(),
    targetUrl: (() => {
      let path = req.url.replace('/api/debug-proxy.js', '');
      if (!path || path === '') path = '/rest/v1/';
      if (!path.startsWith('/')) path = '/' + path;
      if (!path.startsWith('/rest/v1')) path = '/rest/v1' + path;
      return `${process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co'}${path}`;
    })()
  };

  res.status(200).json({
    message: 'Debug proxy working',
    scenarios: scenarios,
    environment: {
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
    }
  });
}
