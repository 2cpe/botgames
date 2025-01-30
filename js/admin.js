const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_KEY = CONFIG.SUPABASE_KEY;

async function initializeAdmin() {
    try {
        // Get products from Supabase
        currentProducts = await ProductManager.getProducts();
        renderProductsList();
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
}

function renderProductsList() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = currentProducts.map(product => `
        <div class="product-item" onclick="editProduct(${product.id})">
            ${product.name}
        </div>
    `).join('');
}

function showAddProductForm() {
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('productId').value = '';
    clearForm();
}

function editProduct(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('shortDescription').value = product.shortDescription;
    document.getElementById('fullDescription').value = product.fullDescription;
    document.getElementById('price').value = product.price;
    document.getElementById('badge').value = product.badge || '';
    document.getElementById('category').value = product.category;
    document.getElementById('images').value = product.images.join('\n');
    document.getElementById('features').value = product.features.join('\n');
    document.getElementById('version').value = product.technicalDetails.version;
    document.getElementById('lastUpdated').value = product.technicalDetails.lastUpdated;
    document.getElementById('framework').value = product.technicalDetails.framework;
    document.getElementById('filesIncluded').value = product.technicalDetails.filesIncluded;
}

class ProductManager {
    static async checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }
        return session;
    }

    static async saveProducts(products) {
        try {
            await this.checkAuth();
            console.log('Saving products:', products);

            // First, delete all existing products
            const { error: deleteError } = await supabase
                .from('products')
                .delete()
                .neq('id', 0);

            if (deleteError) {
                console.error('Delete error:', deleteError);
                throw deleteError;
            }

            // Then insert new products
            const { data, error: insertError } = await supabase
                .from('products')
                .insert(products)
                .select();

            if (insertError) {
                console.error('Insert error:', insertError);
                throw insertError;
            }

            console.log('Saved products:', data);
            localStorage.setItem('products', JSON.stringify(products));
            return true;
        } catch (error) {
            console.error('Error saving products:', error);
            if (error.message === 'Not authenticated') {
                // Redirect to login if not authenticated
                DiscordAuth.redirectToDiscordLogin();
            }
            throw error;
        }
    }

    static async getProducts() {
        try {
            console.log('Fetching products...');
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id');

            if (error) {
                console.error('Fetch error:', error);
                throw error;
            }

            console.log('Fetched products:', data);
            if (data && data.length > 0) {
                localStorage.setItem('products', JSON.stringify(data));
                return data;
            }
            
            return products; // Fallback to default products
        } catch (error) {
            console.error('Error fetching products:', error);
            return products;
        }
    }
}

async function handleProductSubmit(event) {
    event.preventDefault();
    console.log('Submitting product form...');

    const productId = document.getElementById('productId').value;
    const newProduct = {
        id: productId ? parseInt(productId) : Date.now(),
        name: document.getElementById('name').value,
        shortDescription: document.getElementById('shortDescription').value,
        fullDescription: document.getElementById('fullDescription').value,
        price: parseFloat(document.getElementById('price').value),
        badge: document.getElementById('badge').value || null,
        category: document.getElementById('category').value,
        images: document.getElementById('images').value.split('\n').filter(url => url.trim()),
        features: document.getElementById('features').value.split('\n').filter(feature => feature.trim()),
        technicalDetails: {
            version: document.getElementById('version').value,
            lastUpdated: document.getElementById('lastUpdated').value,
            framework: document.getElementById('framework').value,
            filesIncluded: document.getElementById('filesIncluded').value
        }
    };

    console.log('New product:', newProduct);

    if (productId) {
        // Update existing product
        const index = currentProducts.findIndex(p => p.id === parseInt(productId));
        currentProducts[index] = newProduct;
    } else {
        // Add new product
        currentProducts.push(newProduct);
    }

    try {
        // Save to Supabase
        const saved = await ProductManager.saveProducts(currentProducts);
        console.log('Save result:', saved);
        
        if (saved) {
            // Refresh the products list
            currentProducts = await ProductManager.getProducts();
            renderProductsList();
            clearForm();
            alert('Product saved successfully!');
        } else {
            alert('Failed to save product. Please try again.');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
    }
}

function clearForm() {
    document.getElementById('adminProductForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Product';
}

function saveProductsToStorage() {
    localStorage.setItem('products', JSON.stringify(currentProducts));
}

// Update the event listener to handle async
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
}); 