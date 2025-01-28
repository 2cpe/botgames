class APIHandler {
    constructor() {
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

// Create global instance
window.apiHandler = new APIHandler(); 