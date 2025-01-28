// Database configuration
const DB_CONFIG = {
    collections: {
        PRODUCTS: 'products',
        USERS: 'users'
    },
    indexes: {
        products: ['category', 'price', 'createdAt']
    }
};

// Export for use in other files
window.DB_CONFIG = DB_CONFIG; 