const DISCORD_CLIENT_ID = '1327745611230871572';
const REQUIRED_ROLE_ID = '1327749769770307686';
const REDIRECT_URI = 'https://2cpe.github.io/botgames/admin.html';
const GUILD_ID = '1327749495567552592';

class DiscordAuth {
    static init() {
        // Check if we're on the admin page
        if (!window.location.pathname.includes('admin.html')) return;

        // Hide admin container initially
        const adminContainer = document.querySelector('.admin-container');
        if (adminContainer) {
            adminContainer.style.display = 'none';
        }

        // Check if we have a token
        const token = localStorage.getItem('discord_token');
        if (!token) {
            // If we have a code in the URL, exchange it for a token
            const urlParams = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = urlParams.get('access_token');
            
            if (accessToken) {
                localStorage.setItem('discord_token', accessToken);
                // Remove the hash from the URL
                window.location.hash = '';
                this.validateAdmin();
            } else {
                // If no token and no code, redirect to Discord login
                this.redirectToDiscordLogin();
            }
        } else {
            // If we have a token, validate it
            this.validateAdmin();
        }
    }

    static redirectToDiscordLogin() {
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'token',
            scope: 'identify guilds.members.read',
        });

        window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
    }

    static async validateAdmin() {
        try {
            const token = localStorage.getItem('discord_token');
            if (!token) {
                this.handleUnauthorized();
                return;
            }

            try {
                // Get user's guilds and member data
                const user = await this.fetchDiscordUser(token);
                const hasRole = await this.checkUserRole(token, user.id);

                if (!hasRole) {
                    this.handleUnauthorized();
                    return;
                }

                // Sign in to Supabase with Discord
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'discord',
                    options: {
                        redirectTo: REDIRECT_URI,
                        queryParams: {
                            prompt: 'none' // Skip prompt if already authorized
                        }
                    }
                });

                if (error) {
                    console.error('Supabase auth error:', error);
                    throw error;
                }

                // Show admin content
                const adminContainer = document.querySelector('.admin-container');
                if (adminContainer) {
                    adminContainer.style.display = 'grid';
                }
                const loadingMessage = document.getElementById('loadingMessage');
                if (loadingMessage) {
                    loadingMessage.remove();
                }

            } catch (error) {
                console.error('Validation error:', error);
                this.handleUnauthorized();
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.handleUnauthorized();
        }
    }

    static async fetchDiscordUser(token) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        return response.json();
    }

    static async checkUserRole(token, userId) {
        try {
            const response = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 429) {
                // Handle rate limiting
                const retryAfter = response.headers.get('Retry-After') || 5;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return this.checkUserRole(token, userId); // Retry after waiting
            }

            if (!response.ok) throw new Error('Failed to fetch member data');
            const memberData = await response.json();
            
            return memberData.roles.includes(REQUIRED_ROLE_ID);
        } catch (error) {
            console.error('Error checking user role:', error);
            throw error;
        }
    }

    static handleUnauthorized() {
        localStorage.removeItem('discord_token');
        document.body.innerHTML = `
            <div class="unauthorized-message">
                <h1>Unauthorized Access</h1>
                <p>You don't have permission to access this page.</p>
                <button onclick="DiscordAuth.redirectToDiscordLogin()">Login with Discord</button>
                <a href="index.html">Return to Home</a>
            </div>
        `;
    }
}

// Initialize Discord Auth
document.addEventListener('DOMContentLoaded', () => DiscordAuth.init()); 