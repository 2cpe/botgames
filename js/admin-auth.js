class AdminAuth {
    constructor() {
        this.DISCORD_CLIENT_ID = '1327745611230871572'; // Replace with your Discord Client ID
        this.DISCORD_REDIRECT_URI = 'https://2cpe.github.io/botgames/admin.html';
        this.REQUIRED_ROLE_ID = '1327749769770307686'; // Replace with your admin role ID
        this.GUILD_ID = '1327749495567552592'; // Replace with your Discord server ID
        
        this.init();
    }

    init() {
        // Check if we're returning from Discord OAuth
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');
        
        if (accessToken) {
            // Store the token and clear the URL
            localStorage.setItem('discord_token', accessToken);
            window.location.hash = '';
            this.verifyAccess(accessToken);
        } else {
            // Check if we have a stored token
            const storedToken = localStorage.getItem('discord_token');
            if (storedToken) {
                this.verifyAccess(storedToken);
            } else {
                this.redirectToDiscord();
            }
        }
    }

    redirectToDiscord() {
        const params = new URLSearchParams({
            client_id: this.DISCORD_CLIENT_ID,
            redirect_uri: this.DISCORD_REDIRECT_URI,
            response_type: 'token',
            scope: 'identify guilds.members.read',
        });

        window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    }

    async verifyAccess(token) {
        try {
            // Get user info
            const user = await this.fetchUserInfo(token);
            
            // Check if user has the required role
            const hasAccess = await this.checkUserRole(token);

            if (hasAccess) {
                this.showDashboard(user);
            } else {
                localStorage.removeItem('discord_token');
                this.showAccessDenied();
            }
        } catch (error) {
            console.error('Auth error:', error);
            localStorage.removeItem('discord_token');
            this.showAccessDenied();
        }
    }

    async fetchUserInfo(token) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        return await response.json();
    }

    async checkUserRole(token) {
        const response = await fetch(`https://discord.com/api/users/@me/guilds/${this.GUILD_ID}/member`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to check user role');
        }
        
        const member = await response.json();
        return member.roles.includes(this.REQUIRED_ROLE_ID);
    }

    showDashboard(user) {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        
        // Set user info
        const avatarUrl = user.avatar ? 
            `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` :
            'https://cdn.discordapp.com/embed/avatars/0.png';
            
        document.getElementById('user-avatar').src = avatarUrl;
        document.getElementById('user-name').textContent = user.username;
    }

    showAccessDenied() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('access-denied').style.display = 'flex';
    }
}

// Initialize authentication
const auth = new AdminAuth(); 