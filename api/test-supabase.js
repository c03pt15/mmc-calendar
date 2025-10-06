export default async function handler(req, res) {
  console.log('=== TEST SUPABASE DIRECT ===');
  
  try {
    // Test direct connection to Supabase
    const response = await fetch('https://zmbptzxjuuveqmcevtaz.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYnB0enhqdXV2ZXFtY2V2dGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzEsImV4cCI6MjA1MDU1MDg3MX0.YourAnonKey', // Replace with your actual anon key
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYnB0enhqdXV2ZXFtY2V2dGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzEsImV4cCI6MjA1MDU1MDg3MX0.YourAnonKey'
      }
    });
    
    console.log('Supabase response status:', response.status);
    console.log('Supabase response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Supabase response data:', data);
    
    res.status(200).json({
      message: 'Direct Supabase test completed',
      status: response.status,
      data: data
    });
    
  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({
      error: 'Supabase test failed',
      message: error.message
    });
  }
}
