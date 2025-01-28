const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Check if environment variable exists
  if (!process.env.TEBEX_SECRET) {
    console.error('TEBEX_SECRET environment variable is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    console.log('Attempting to fetch products with Tebex key:', process.env.TEBEX_SECRET.substring(0, 4) + '...');
    
    const response = await fetch('https://plugin.tebex.io/listings', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched products');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error in getProducts:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching products', details: error.message })
    };
  }
}; 