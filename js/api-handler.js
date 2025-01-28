class APIHandler {
    constructor() {
        if (!window.dbHandler) {
            throw new Error('Database handler not initialized');
        }
        this.githubToken = ENV.GITHUB.TOKEN;
    }

    async fetchProducts() {
        try {
            // Use Firebase instead of GitHub
            const products = await dbHandler.getAllProducts();
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async updateProduct(productId, data) {
        try {
            await dbHandler.updateProduct(productId, data);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            await dbHandler.deleteProduct(productId);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async addProduct(data) {
        try {
            const productId = await dbHandler.addProduct(data);
            return productId;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }
}

// Create global instance only after dbHandler is initialized
try {
    window.apiHandler = new APIHandler();
} catch (error) {
    console.error('Failed to initialize API handler:', error);
} 