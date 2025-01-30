const DISCORD_CLIENT_ID = '1327745611230871572';
const REQUIRED_ROLE_ID = '1327749769770307686';
const REDIRECT_URI = 'https://2cpe.github.io/botgames/admin.html';
const GUILD_ID = '1327749495567552592';

class DiscordAuth {
    static init() {
        // Check if we're on the admin page
        if (!window.location.pathname.includes('admin.html')) return;

        console.log('Initializing Discord Auth...');

        // Hide admin container initially
        const adminContainer = document.querySelector('.admin-container');
        if (adminContainer) {
            adminContainer.style.display = 'none';
        }

        // Check if we have a token
        const token = localStorage.getItem('discord_token');
        if (!token) {
            console.log('No token found, checking URL...');
            // If we have a code in the URL, exchange it for a token
            const urlParams = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = urlParams.get('access_token');
            
            if (accessToken) {
                console.log('Found access token in URL');
                localStorage.setItem('discord_token', accessToken);
                // Remove the hash from the URL
                window.location.hash = '';
                this.validateAdmin();
            } else {
                console.log('No token found, redirecting to Discord login');
                // If no token and no code, redirect to Discord login
                this.redirectToDiscordLogin();
            }
        } else {
            console.log('Found existing token, validating...');
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
                console.log('No token found');
                this.handleUnauthorized();
                return;
            }

            console.log('Validating admin access...');

            // Get user's guilds and member data
            const user = await this.fetchDiscordUser(token);
            console.log('User data:', user);

            const hasRole = await this.checkUserRole(token, user.id);
            console.log('Has required role:', hasRole);

            if (!hasRole) {
                console.log('User lacks required role');
                this.handleUnauthorized();
                return;
            }

            // User is authorized, show admin content
            const adminContainer = document.querySelector('.admin-container');
            if (adminContainer) {
                adminContainer.style.display = 'grid';
            }
            const loadingMessage = document.getElementById('loadingMessage');
            if (loadingMessage) {
                loadingMessage.remove();
            }

            // Initialize Supabase session
            const { data: { session }, error } = await supabase.auth.getSession();
            if (!session) {
                console.log('No Supabase session, signing in...');
                // Sign in to Supabase with Discord
                await supabase.auth.signInWithOAuth({
                    provider: 'discord',
                    options: {
                        redirectTo: REDIRECT_URI
                    }
                });
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
            console.log('Checking role for user:', userId);
            console.log('Required role:', REQUIRED_ROLE_ID);
            
            const response = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Member fetch error:', await response.text());
                throw new Error('Failed to fetch member data');
            }

            const memberData = await response.json();
            console.log('Member data:', memberData);
            
            const hasRole = memberData.roles.includes(REQUIRED_ROLE_ID);
            console.log('Has required role:', hasRole);
            
            return hasRole;
        } catch (error) {
            console.error('Role check error:', error);
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