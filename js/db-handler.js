class DatabaseHandler {
    constructor() {
        try {
            if (!firebase.apps.length) {
                throw new Error('Firebase not initialized');
            }
            this.db = firebase.firestore();
            this.productsCollection = this.db.collection('products');
            
            // Test the connection
            this.productsCollection.get().then(() => {
                console.log('Firestore connection successful');
            }).catch(error => {
                console.error('Firestore connection error:', error);
            });
        } catch (error) {
            console.error('DatabaseHandler initialization error:', error);
            throw error;
        }
    }

    async getAllProducts() {
        try {
            const snapshot = await this.productsCollection.get();
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
            const docRef = await this.productsCollection.add({
                ...productData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async updateProduct(productId, productData) {
        try {
            await this.productsCollection.doc(productId).update({
                ...productData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            await this.productsCollection.doc(productId).delete();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async getProduct(productId) {
        try {
            const doc = await this.productsCollection.doc(productId).get();
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
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