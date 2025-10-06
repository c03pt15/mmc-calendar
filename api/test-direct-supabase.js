export default async function handler(req, res) {
  console.log('=== TEST DIRECT SUPABASE ===');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://zmbptzxjuuveqmcevtaz.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('API Key set:', !!supabaseKey);
    
    if (!supabaseKey) {
      return res.status(500).json({
        error: 'SUPABASE_ANON_KEY not set in environment variables'
      });
    }
    
    // Test direct connection to Supabase
    const testUrl = `${supabaseUrl}/rest/v1/tasks?select=*&limit=1`;
    console.log('Testing URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response data:', data);
    
    res.status(200).json({
      message: 'Direct Supabase test completed',
      status: response.status,
      data: data,
      success: response.status === 200
    });
    
  } catch (error) {
    console.error('Direct Supabase test error:', error);
    res.status(500).json({
      error: 'Direct Supabase test failed',
      message: error.message
    });
  }
}
