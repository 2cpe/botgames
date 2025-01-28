// Replace with your Netlify functions URL
const NETLIFY_FUNCTIONS_URL = 'https://your-netlify-app.netlify.app/.netlify/functions';

async function fetchTebexProducts() {
    try {
        const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/getProducts`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to fetch products');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Tebex products:', error);
        // Show error to user
        const storeGrid = document.querySelector('.store-grid');
        if (storeGrid) {
            storeGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
        }
        return [];
    }
}

function createProductCard(product) {
    return `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <div class="product-image">
                <img src="${product.image || 'assets/images/default-product.jpg'}" alt="${product.name}">
                ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
            </div>
            <div class="product-content">
                <h3>${product.name}</h3>
                <p>${product.short_description || product.description}</p>
                <div class="product-features">
                    ${product.features ? product.features.map(feature => 
                        `<span><i class="fas fa-check"></i> ${feature}</span>`
                    ).join('') : ''}
                </div>
                <div class="product-price">
                    <span class="price">$${product.price}</span>
                    <a href="product.html?id=${product.id}" class="buy-btn">View Details</a>
                </div>
            </div>
        </div>
    `;
}

async function loadProductDetails(productId) {
    try {
        const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/getProduct?id=${productId}`);
        const product = await response.json();
        
        // Update product page content
        document.querySelector('.category-tag').textContent = product.category || 'Premium Script';
        document.querySelector('.product-header h1').textContent = product.name;
        document.querySelector('.price-tag').textContent = `$${product.price}`;
        document.querySelector('.product-description p').textContent = product.description;
        
        // Update images
        if (product.images && product.images.length > 0) {
            document.getElementById('mainImage').src = product.images[0];
            const thumbnailGrid = document.querySelector('.thumbnail-grid');
            thumbnailGrid.innerHTML = product.images.map((img, index) => `
                <img src="${img}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}">
            `).join('');
        }

        // Update buy button
        document.querySelector('.buy-now-btn').href = product.url;
        
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Initialize store page
async function initializeStore() {
    const products = await fetchTebexProducts();
    const storeGrid = document.querySelector('.store-grid');
    if (storeGrid) {
        storeGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    }
}

// Initialize product page
function initializeProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        loadProductDetails(productId);
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.store-grid')) {
        initializeStore();
    } else if (document.querySelector('.product-detail')) {
        initializeProduct();
    }
}); 