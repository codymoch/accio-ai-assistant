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
      // API returned an error
      return res.status(response.status).json(data);
    }

    // Success - return the data as-is
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: { 
        message: error.message,
        type: 'server_error'
      }
    });
  }
}
