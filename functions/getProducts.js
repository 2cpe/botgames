const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // For development, use specific origin in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Log environment check
  console.log('Environment check:', {
    hasSecret: !!process.env.TEBEX_SECRET,
    secretLength: process.env.TEBEX_SECRET ? process.env.TEBEX_SECRET.length : 0
  });

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (!process.env.TEBEX_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error', 
        message: 'TEBEX_SECRET is not set'
      })
    };
  }

  try {
    console.log('Attempting to fetch server information...');
    const response = await fetch('https://plugin.tebex.io/listings', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Tebex API Error:', {
        status: response.status,
        data: errorData
      });
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    // Format the actual Tebex data
    const formattedPackages = Array.isArray(data) ? data.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image || './assets/images/default-product.jpg',
      short_description: pkg.short_description || pkg.description,
      description: pkg.description,
      features: [
        'Real-time statistics',
        'Customizable UI',
        'Easy installation',
        'Regular updates',
        '24/7 support'
      ]
    })) : [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedPackages)
    };
  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      env: {
        hasSecret: !!process.env.TEBEX_SECRET,
        secretLength: process.env.TEBEX_SECRET ? process.env.TEBEX_SECRET.length : 0
      }
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed fetching products',
        details: error.message
      })
    };
  }
}; 