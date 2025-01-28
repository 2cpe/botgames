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

  const { id } = event.queryStringParameters;
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Product ID is required' })
    };
  }
  
  try {
    console.log('Attempting to fetch product:', id);
    
    const response = await fetch(`https://plugin.tebex.io/listings/${id}`, {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched product details');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error in getProduct:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching product details', details: error.message })
    };
  }
}; 