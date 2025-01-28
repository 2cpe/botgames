const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (!process.env.TEBEX_SECRET) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://2cpe.github.io',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const { id } = event.queryStringParameters;
  if (!id) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://2cpe.github.io',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Product ID is required' })
    };
  }
  
  try {
    const response = await fetch(`https://plugin.tebex.io/listings/${id}`, {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://2cpe.github.io',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://2cpe.github.io',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Failed fetching product details', details: error.message })
    };
  }
}; 