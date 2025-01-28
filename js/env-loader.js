// Load environment variables from .env file
class EnvLoader {
    static async loadToken() {
        try {
            const response = await fetch('/.env');
            const text = await response.text();
            const tokenLine = text.split('\n').find(line => line.startsWith('GITHUB_TOKEN='));
            if (tokenLine) {
                return tokenLine.split('=')[1].trim();
            }
            throw new Error('GitHub token not found in .env');
        } catch (error) {
            console.error('Failed to load GitHub token:', error);
            return null;
        }
    }
} 