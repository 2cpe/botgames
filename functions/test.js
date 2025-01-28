exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      hasSecret: !!process.env.TEBEX_SECRET,
      secretLength: process.env.TEBEX_SECRET ? process.env.TEBEX_SECRET.length : 0
    })
  };
}; 