export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Proxy test is working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}
