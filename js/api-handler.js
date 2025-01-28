class APIHandler {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.branch = API_CONFIG.branch;
        this.token = null;
    }

    async initialize() {
        try {
            this.token = await EnvLoader.loadToken();
            if (!this.token) {
                throw new Error('Failed to load GitHub token');
            }
            console.log('API Handler initialized successfully');
        } catch (error) {
            console.error('Failed to initialize API Handler:', error);
            throw error;
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

            // First, get the current file and its SHA
            const currentFileResponse = await fetch(`${this.baseUrl}/db/products.json`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!currentFileResponse.ok) {
                throw new Error(`Failed to fetch current file: ${currentFileResponse.status}`);
            }

            const currentFile = await currentFileResponse.json();

            // Prepare the new content
            const newContent = {
                products: products,
                lastUpdate: new Date().toISOString()
            };

            // Convert to base64
            const encodedContent = btoa(JSON.stringify(newContent, null, 2));

            // Update the file using GitHub's API
            const updateResponse = await fetch(`${this.baseUrl}/db/products.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update products',
                    content: encodedContent,
                    sha: currentFile.sha,
                    branch: this.branch
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                console.error('GitHub API Error:', errorData);
                throw new Error(`Failed to update file: ${updateResponse.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error updating products:', error);
            throw error; // Re-throw to handle in the calling code
        }
    }
} 