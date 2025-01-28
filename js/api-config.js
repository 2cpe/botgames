// Load environment variables from .env file
const API_CONFIG = {
    token: process.env.GITHUB_TOKEN || '',
    baseUrl: 'https://api.github.com/repos/2cpe/botgames/contents',
    branch: 'main'
}; 