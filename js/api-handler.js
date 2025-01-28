class GitHubAPI {
    constructor() {
        this.owner = '2cpe'; // Your GitHub username
        this.repo = 'botgames'; // Your repository name
        this.branch = 'main'; // Your branch name
        this.apiToken = null; // Renamed from token to apiToken
    }

    setToken(apiToken) {
        this.apiToken = apiToken; // Store as apiToken
    }

    async fetchProducts() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/data/products.json`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async updateProducts(products) {
        if (!this.apiToken) throw new Error('No API token provided'); // Updated error message

        try {
            // First get the current file (to get the SHA)
            const currentFile = await this.getFile('data/products.json');
            
            // Prepare the new content
            const content = {
                products: products,
                lastUpdate: new Date().toISOString()
            };

            // Update the file
            await this.updateFile(
                'data/products.json',
                JSON.stringify(content, null, 2),
                'Update products',
                currentFile.sha
            );
        } catch (error) {
            console.error('Error updating products:', error);
            throw error;
        }
    }

    async getFile(path) {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${this.apiToken}`, // Using apiToken here
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error('Failed to get file');
        return await response.json();
    }

    async updateFile(path, content, message, sha) {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.apiToken}`, // Using apiToken here
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                content: btoa(content),
                sha: sha,
                branch: this.branch
            })
        });

        if (!response.ok) throw new Error('Failed to update file');
        return await response.json();
    }
}

// Export the API handler
window.gitHubAPI = new GitHubAPI(); 