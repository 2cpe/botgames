class DatabaseHandler {
    constructor() {
        try {
            if (!firebase.apps.length) {
                throw new Error('Firebase not initialized');
            }
            this.db = firebase.firestore();
            this.rtdb = firebase.database();
            this.productsRef = this.rtdb.ref('products');
            this.usersRef = this.rtdb.ref('users');
            
            // Test the connection
            this.productsRef.get().then(() => {
                console.log('Firestore connection successful');
            }).catch(error => {
                console.error('Firestore connection error:', error);
            });

            console.log('Database handler initialized successfully');
        } catch (error) {
            console.error('DatabaseHandler initialization error:', error);
            throw error;
        }
    }

    async getAllProducts() {
        try {
            const snapshot = await this.productsRef.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            const docRef = await this.productsRef.push(productData);
            return docRef.key;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async updateProduct(productId, productData) {
        try {
            await this.productsRef.child(productId).update(productData);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            await this.productsRef.child(productId).remove();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async getProduct(productId) {
        try {
            const doc = await this.productsRef.child(productId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting product:', error);
            throw error;
        }
    }
}

// Initialize handler after Firebase is ready
function initDatabaseHandler() {
    try {
        if (!window.dbHandler) {
            window.dbHandler = new DatabaseHandler();
        }
    } catch (error) {
        console.error('Failed to initialize database handler:', error);
        // Retry after a short delay
        setTimeout(initDatabaseHandler, 1000);
    }
}

// Start initialization
initDatabaseHandler(); 