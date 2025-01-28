class AdminAuth {
    constructor() {
        this.DISCORD_CLIENT_ID = ENV.DISCORD.CLIENT_ID;
        this.DISCORD_REDIRECT_URI = ENV.DISCORD.REDIRECT_URI;
        this.REQUIRED_ROLE_ID = ENV.DISCORD.REQUIRED_ROLE_ID;
        this.GUILD_ID = ENV.DISCORD.GUILD_ID;
        
        // Add debug logging
        console.log('AdminAuth initialized');
        this.init();
    }

    init() {
        console.log('Starting auth initialization');
        
        // Check if we're returning from Discord OAuth
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');
        
        console.log('Access token from URL:', accessToken ? 'Present' : 'Not present');
        console.log('Stored token:', localStorage.getItem('discord_token') ? 'Present' : 'Not present');

        if (accessToken) {
            console.log('Using access token from URL');
            localStorage.setItem('discord_token', accessToken);
            window.location.hash = '';
            this.verifyAccess(accessToken);
        } else {
            const storedToken = localStorage.getItem('discord_token');
            if (storedToken) {
                console.log('Using stored token');
                this.verifyAccess(storedToken);
            } else {
                console.log('No token found, redirecting to Discord');
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
            prompt: 'consent'  // Add this to force consent screen
        });

        const url = `https://discord.com/api/oauth2/authorize?${params}`;
        console.log('Redirecting to:', url);
        window.location.href = url;
    }

    async verifyAccess(token) {
        try {
            console.log('Verifying access...');
            
            // Get user info
            console.log('Fetching user info...');
            const user = await this.fetchUserInfo(token);
            console.log('User info received:', user);
            
            // Check if user has the required role
            console.log('Checking user role...');
            const hasAccess = await this.checkUserRole(token);
            console.log('Has access:', hasAccess);

            if (hasAccess) {
                this.showDashboard(user);
            } else {
                console.log('Access denied: User does not have required role');
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
        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('User info error:', errorData);
                throw new Error(`Failed to fetch user info: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Fetch user info error:', error);
            throw error;
        }
    }

    async checkUserRole(token) {
        try {
            const response = await fetch(`https://discord.com/api/users/@me/guilds/${this.GUILD_ID}/member`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Role check error:', errorData);
                throw new Error(`Failed to check user role: ${response.status}`);
            }
            
            const member = await response.json();
            console.log('Member data:', member);
            return member.roles.includes(this.REQUIRED_ROLE_ID);
        } catch (error) {
            console.error('Check role error:', error);
            throw error;
        }
    }

    async showDashboard(user) {
        try {
            // Set user role if they have the required Discord role
            await authRoles.setUserRole(user.id, 'admin');
            
            console.log('Showing dashboard for user:', user.username);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
            
            const avatarUrl = user.avatar ? 
                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` :
                'https://cdn.discordapp.com/embed/avatars/0.png';
                
            document.getElementById('user-avatar').src = avatarUrl;
            document.getElementById('user-name').textContent = user.username;
        } catch (error) {
            console.error('Error setting up user:', error);
            this.showAccessDenied();
        }
    }

    showAccessDenied() {
        console.log('Showing access denied screen');
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('access-denied').style.display = 'flex';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        document.querySelector('.denied-content').appendChild(errorDiv);
    }
}

// Initialize authentication
const auth = new AdminAuth(); 