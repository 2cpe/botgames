document.addEventListener('DOMContentLoaded', function() {
    const CLIENT_ID = '1327745611230871572';
    const REDIRECT_URI = 'https://2cpe.github.io/botgames/login.html';
    const DISCORD_ENDPOINT = 'https://discord.com/oauth2/authorize?client_id=1327745611230871572&response_type=code&redirect_uri=https%3A%2F%2F2cpe.github.io%2Fbotgames%2Flogin.html&scope=guilds.members.read+identify';

    // Check for OAuth code in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        exchangeCodeForToken(code);
        return;
    }

    // Then check if user is already logged in
    const token = localStorage.getItem('discord_token');
    if (token) {
        validateAndRedirect(token);
        return;
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
                client_secret: 'IkO5w0-DpVrNHkkySv21wh8nOgfukn-l',
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'https://2cpe.github.io/botgames/login.html',
                scope: 'identify guilds.members.read'
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Token response:', data); // For debugging

        if (data.access_token) {
            localStorage.setItem('discord_token', `Bearer ${data.access_token}`);
            window.location.href = 'admin.html';
        } else {
            console.error('No access token received:', data);
            showError('Failed to authenticate with Discord');
        }
    } catch (error) {
        console.error('Error exchanging code:', error);
        showError('Failed to connect to Discord');
    }
}

async function validateAndRedirect(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': token,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData); // For debugging
            window.location.href = 'admin.html';
        } else {
            localStorage.removeItem('discord_token');
            showError('Invalid or expired token');
        }
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('discord_token');
        showError('Failed to validate token');
    }
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
} 