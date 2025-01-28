class APIHandler {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.branch = API_CONFIG.branch;
        this.token = null;
    }

    async initialize() {
        this.token = await EnvLoader.loadToken();
        if (!this.token) {
            throw new Error('Failed to load GitHub token');
        }
    }

    async fetchProducts() {
        try {
            if (!this.token) await this.initialize();
            
            const response = await fetch(`${this.baseUrl}/db/products.json`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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
            if (!this.token) await this.initialize();

            // Get the current file to get its SHA
            const currentFile = await fetch(`${this.baseUrl}/db/products.json`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
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