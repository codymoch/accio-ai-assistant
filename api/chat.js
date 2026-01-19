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

  const API_KEY = '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';

  
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
      // Log the full error to Vercel logs
      console.error('Anthropic API Error:', JSON.stringify(data));
      console.error('Status:', response.status);
      console.error('Request body:', JSON.stringify(req.body).substring(0, 500));
      
      // Return error with details for debugging
      return res.status(response.status).json({
        error: data.error || data,
        debug: {
          status: response.status,
          keyPrefix: API_KEY.substring(0, 20),
          keyLength: API_KEY.length
        }
      });
    }

    // Success - return the data as-is
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
