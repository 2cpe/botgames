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
    const infoResponse = await fetch('https://plugin.tebex.io/information', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });

    const infoData = await infoResponse.json();
    console.log('Server info response:', {
      status: infoResponse.status,
      ok: infoResponse.ok,
      data: infoData
    });

    if (!infoResponse.ok) {
      throw new Error(`API Info Error: ${infoResponse.status} - ${JSON.stringify(infoData)}`);
    }

    console.log('Fetching packages...');
    const packagesResponse = await fetch('https://plugin.tebex.io/packages', {
      headers: {
        'X-Tebex-Secret': process.env.TEBEX_SECRET
      }
    });

    const packagesData = await packagesResponse.json();
    console.log('Packages response:', {
      status: packagesResponse.status,
      ok: packagesResponse.ok,
      count: Array.isArray(packagesData) ? packagesData.length : 'not an array'
    });

    if (!packagesResponse.ok) {
      throw new Error(`Packages Error: ${packagesResponse.status} - ${JSON.stringify(packagesData)}`);
    }

    const formattedPackages = packagesData.map(pkg => ({
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
    console.error('Function error:', {
      message: error.message,
      stack: error.stack,
      env: {
        hasSecret: !!process.env.TEBEX_SECRET,
        secretStart: process.env.TEBEX_SECRET ? process.env.TEBEX_SECRET.substring(0, 4) : null
      }
    });

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