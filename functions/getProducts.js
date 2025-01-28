const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // For development, use specific origin in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

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
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    // First, try to get the server info to verify credentials
    const response = await fetch('https://plugin.tebex.io/information', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // If credentials are valid, get the packages
    const packagesResponse = await fetch('https://plugin.tebex.io/packages', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });

    if (!packagesResponse.ok) {
      throw new Error(`Packages Error: ${packagesResponse.status}`);
    }

    const packages = await packagesResponse.json();

    // Format the packages for the frontend
    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image || './assets/images/default-product.jpg',
      short_description: pkg.description,
      description: pkg.description,
      features: [
        'Real-time statistics',
        'Customizable UI',
        'Easy installation',
        'Regular updates',
        '24/7 support'
      ]
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedPackages)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed fetching products', 
        details: error.message,
        env: process.env.TEBEX_SECRET ? 'Secret key is set' : 'Secret key is missing'
      })
    };
  }
}; 