// Load environment variables from .env file
class EnvLoader {
    static async loadEnv() {
        try {
            const response = await fetch('/.env');
            const text = await response.text();
            const env = {};
            
            text.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    env[key.trim()] = value.trim();
                }
            });
            
            return env;
        } catch (error) {
            console.error('Failed to load .env:', error);
            throw error;
        }
    }
} 