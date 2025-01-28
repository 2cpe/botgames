const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request
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

  const { id } = event.queryStringParameters;
  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Product ID is required' })
    };
  }
  
  try {
    const response = await fetch(`https://plugin.tebex.io/package/${id}`, {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const package = await response.json();
    
    // Format the package data
    const formattedPackage = {
      id: package.id,
      name: package.name,
      price: package.price,
      image: package.image || './assets/images/default-product.jpg',
      description: package.description,
      category: 'Premium Script',
      features: [
        'Real-time statistics',
        'Customizable UI',
        'Easy installation',
        'Regular updates',
        '24/7 support'
      ],
      url: package.url || `https://store.tebex.io/package/${id}`
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedPackage)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed fetching product details', 
        details: error.message,
        env: process.env.TEBEX_SECRET ? 'Secret key is set' : 'Secret key is missing'
      })
    };
  }
}; 