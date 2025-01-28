class APIHandler {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/2cpe/botgames/contents';
        this.branch = 'main';
    }

    async fetchProducts() {
        try {
            // Use public access for reading products
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
            // Use a secure backend endpoint instead of direct GitHub access
            const response = await fetch('/api/products/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Send Discord token for authentication
                    'Authorization': `Bearer ${localStorage.getItem('discord_token')}`
                },
                body: JSON.stringify(products)
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

// Make APIHandler available globally
window.APIHandler = APIHandler; 