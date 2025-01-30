// Load environment variables
require('dotenv').config();

let currentProducts = JSON.parse(localStorage.getItem('products')) || products;

function initializeAdmin() {
    renderProductsList();
    saveProductsToStorage();
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
    static async getToken() {
        try {
            const img = document.getElementById('tokenImage');
            if (!img) return null;
            
            const token = await SteganographyUtil.extractToken(img);
            return token;
        } catch (error) {
            console.error('Error extracting token:', error);
            return null;
        }
    }

    static async saveProducts(products) {
        try {
            const token = await this.getToken();
            if (!token) {
                throw new Error('Could not retrieve token');
            }
            
            const owner = '2cpe';
            const repo = 'botgames';
            const path = 'data/products.json';

            // Get current file SHA (needed for updating)
            const currentFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                headers: {
                    'Authorization': `token ${token}`,
                }
            }).then(res => res.json());

            // Prepare the content
            const content = JSON.stringify(products, null, 2);

            // Update file in GitHub
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update products data',
                    content: btoa(content),
                    sha: currentFile.sha
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save products');
            }

            localStorage.setItem('products', JSON.stringify(products));
            return true;
        } catch (error) {
            console.error('Error saving products:', error);
            return false;
        }
    }

    static async getProducts() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/2cpe/botgames/main/data/products.json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();
            localStorage.setItem('products', JSON.stringify(products));
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return JSON.parse(localStorage.getItem('products')) || products;
        }
    }
}

async function handleProductSubmit(event) {
    event.preventDefault();

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

    if (productId) {
        // Update existing product
        const index = currentProducts.findIndex(p => p.id === parseInt(productId));
        currentProducts[index] = newProduct;
    } else {
        // Add new product
        currentProducts.push(newProduct);
    }

    // Save to GitHub
    const saved = await ProductManager.saveProducts(currentProducts);
    
    if (saved) {
        renderProductsList();
        clearForm();
        alert('Product saved successfully!');
    } else {
        alert('Failed to save product. Please try again.');
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

// Initialize admin panel
document.addEventListener('DOMContentLoaded', initializeAdmin); 