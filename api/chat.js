export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const API_KEY = process.env.ANTHROPIC_API_KEY; // ← Changed this line
  
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.' 
    });
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Anthropic API Error:', JSON.stringify(data));
      console.error('Status:', response.status);
      
      return res.status(response.status).json({
        error: data.error || data
      });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: { 
        message: error.message,
        type: 'server_error'
      }
    });
  }
}
