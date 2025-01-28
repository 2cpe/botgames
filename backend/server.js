require('dotenv').config();
const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'https://2cpe.github.io',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// Verify Discord token and admin role
async function verifyAdmin(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me/guilds/1327749495567552592/member', {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) return false;
        
        const member = await response.json();
        return member.roles.includes('1327749769770307686'); // Admin role ID
    } catch {
        return false;
    }
}

app.post('/api/products/update', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token || !(await verifyAdmin(token))) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { products } = req.body;
        
        // Get current file
        const { data: file } = await octokit.repos.getContent({
            owner: '2cpe',
            repo: 'botgames',
            path: 'db/products.json'
        });

        // Update file
        await octokit.repos.createOrUpdateFileContents({
            owner: '2cpe',
            repo: 'botgames',
            path: 'db/products.json',
            message: 'Update products',
            content: Buffer.from(JSON.stringify({ 
                products,
                lastUpdate: new Date().toISOString()
            }, null, 2)).toString('base64'),
            sha: file.sha,
            branch: 'main'
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Failed to update products' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 