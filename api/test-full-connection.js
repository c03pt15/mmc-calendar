export default async function handler(req, res) {
  console.log('=== TESTING FULL CONNECTION ===');
  
  try {
    // Test the proxy endpoint
    const proxyUrl = 'https://mmc-calendar.atlasveterans.ca/api/supabase-proxy-fixed.js/rest/v1/tasks?select=*&limit=1';
    
    console.log('Testing proxy URL:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Proxy response status:', response.status);
    console.log('Proxy response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Proxy response data:', data);
    
    res.status(200).json({
      message: 'Full connection test completed',
      proxyStatus: response.status,
      proxyData: data,
      success: response.status === 200
    });
    
  } catch (error) {
    console.error('Full connection test error:', error);
    res.status(500).json({
      error: 'Full connection test failed',
      message: error.message
    });
  }
}
