export default function handler(req, res) {
  console.log('=== DEBUG API CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('========================');

  res.status(200).json({
    message: 'Debug API is working',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}
