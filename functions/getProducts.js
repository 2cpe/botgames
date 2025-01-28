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
    const response = await fetch('https://plugin.tebex.io/store', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET,
        'Content-Type': 'application/json'
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

    // Create dummy data for testing
    const dummyPackages = [
      {
        id: 1,
        name: "Modern UI Dashboard",
        price: 24.99,
        image: "./assets/images/default-product.jpg",
        short_description: "A sleek and intuitive dashboard interface",
        description: "A modern dashboard interface for your FiveM server",
        features: [
          'Real-time statistics',
          'Customizable UI',
          'Easy installation',
          'Regular updates',
          '24/7 support'
        ]
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(dummyPackages)
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