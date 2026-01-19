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
      // Return the full error details for debugging
      res.status(response.status).json({ 
        error: data,
        apiKeyPrefix: API_KEY.substring(0, 20) + '...',
        apiKeyLength: API_KEY.length
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
