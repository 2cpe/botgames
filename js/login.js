document.addEventListener('DOMContentLoaded', function() {
    const CLIENT_ID = '1327745611230871572';
    const REDIRECT_URI = 'https://2cpe.github.io/botgames/admin.html';
    const DISCORD_ENDPOINT = 'https://discord.com/oauth2/authorize?client_id=1327745611230871572&response_type=code&redirect_uri=https%3A%2F%2F2cpe.github.io%2Fbotgames%2Fadmin.html&scope=guilds.members.read+identify';

    // Check if user is already logged in
    const token = localStorage.getItem('discord_token');
    if (token) {
        validateAndRedirect(token);
    }

    // Check for OAuth code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        exchangeCodeForToken(code);
    }

    document.getElementById('discordLoginBtn').addEventListener('click', () => {
        window.location.href = DISCORD_ENDPOINT;
    });
});

async function exchangeCodeForToken(code) {
    try {
        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: '1327745611230871572',
                client_secret: 'IkO5w0-DpVrNHkkySv21wh8nOgfukn-l', // You'll need to handle this securely
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'https://2cpe.github.io/botgames/admin.html',
                scope: 'identify guilds.members.read'
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('discord_token', data.access_token);
            window.location.href = 'admin.html';
        } else {
            console.error('Failed to exchange code for token');
        }
    } catch (error) {
        console.error('Error exchanging code:', error);
    }
}

async function validateAndRedirect(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            window.location.href = 'admin.html';
        } else {
            localStorage.removeItem('discord_token');
        }
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('discord_token');
    }
} 