class APIHandler {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/2cpe/botgames/contents';
        this.branch = 'main';
        // Your GitHub Personal Access Token (with repo scope)
        this.token = 'YOUR_GITHUB_TOKEN';
    }

    async fetchProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/db/products.json`);
            const data = await response.json();
            const content = atob(data.content);
            return JSON.parse(content).products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async updateProducts(products) {
        try {
            // Get the current file to get its SHA
            const currentFile = await fetch(`${this.baseUrl}/db/products.json`);
            const fileData = await currentFile.json();

            // Prepare new content
            const newContent = {
                products: products,
                lastUpdate: new Date().toISOString()
            };

            // Convert to base64
            const content = btoa(JSON.stringify(newContent, null, 2));

            // Update file in GitHub
            const response = await fetch(`${this.baseUrl}/db/products.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update products',
                    content: content,
                    sha: fileData.sha,
                    branch: this.branch
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update products');
            }

            return true;
        } catch (error) {
            console.error('Error updating products:', error);
            return false;
        }
    }
} 