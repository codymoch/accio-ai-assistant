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
    console.log('Making request to Anthropic API...');
    console.log('API Key length:', API_KEY.length);
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data).substring(0, 200));
    
    if (!response.ok) {
      console.error('API Error:', data);
      // Send back detailed error info
      res.status(200).json({ 
        debugInfo: {
          status: response.status,
          error: data,
          keyLength: API_KEY.length,
          keyStart: API_KEY.substring(0, 15)
        }
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Caught error:', error);
    res.status(200).json({ 
      debugInfo: {
        error: error.message,
        stack: error.stack
      }
    });
  }
}
