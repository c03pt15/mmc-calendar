export default async function handler(req, res) {
  console.log('=== DEBUG CATCH-ALL ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Path from query:', req.query.path);
  console.log('Is array:', Array.isArray(req.query.path));
  console.log('Length:', req.query.path ? req.query.path.length : 'undefined');

  // Test the catch-all proxy
  try {
    const proxyUrl = 'https://mmc-calendar.atlasveterans.ca/api/supabase-proxy/tasks?select=*&limit=1';
    console.log('Testing proxy URL:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    res.status(200).json({
      message: 'Debug catch-all completed',
      proxyStatus: response.status,
      proxyData: data,
      query: req.query
    });
    
  } catch (error) {
    console.error('Debug catch-all error:', error);
    res.status(500).json({
      error: 'Debug catch-all failed',
      message: error.message
    });
  }
}
