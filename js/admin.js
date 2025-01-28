class AdminDashboard {
    constructor() {
        // Initialize products array if it doesn't exist
        if (typeof products === 'undefined') {
            window.products = [];
        }
        
        this.initializeEventListeners();
        this.loadProducts();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

        // Modal close button
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeProductModal();
        });

        // Product form submission
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('discord_token');
            window.location.href = 'index.html';
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    }

    loadProducts() {
        try {
            const productsGrid = document.querySelector('.products-grid');
            
            // Add loading animation
            productsGrid.innerHTML = `
                <div class="loading-products">
                    <div class="loader"></div>
                    <p>Loading products...</p>
                </div>
            `;

            setTimeout(() => {
                if (!products || !products.length) {
                    productsGrid.innerHTML = `
                        <div class="no-products">
                            <i class="fas fa-box-open"></i>
                            <p>No products found. Add your first product!</p>
                        </div>
                    `;
                    return;
                }
                
                productsGrid.innerHTML = products.map(product => this.renderProductCard(product)).join('');
            }, 500); // Simulate loading for better UX

        } catch (error) {
            this.handleError(error, 'Failed to load products');
        }
    }

    renderProductCard(product) {
        return `
            <div class="product-card-admin">
                <div class="quick-edit">
                    <input type="number" 
                        value="${product.price}" 
                        step="0.01" 
                        id="quick-price-${product.id}"
                        onchange="adminDashboard.quickUpdatePrice(${product.id}, this.value)"
                    >
                </div>
                
                <div class="product-header">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.shortDescription}</p>
                    </div>
                    <div class="price-tag">${product.price.toFixed(2)}</div>
                </div>

                <div class="product-meta">
                    ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                    <span class="category">${product.category}</span>
                </div>

                <div class="card-actions">
                    <button class="edit-btn" onclick="adminDashboard.editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit Details
                    </button>
                    <button class="delete-btn" onclick="adminDashboard.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    openProductModal(product = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');

        if (product) {
            form.elements.name.value = product.name;
            form.elements.shortDescription.value = product.shortDescription;
            form.elements.fullDescription.value = product.fullDescription;
            form.elements.price.value = product.price;
            form.elements.badge.value = product.badge || '';
            form.elements.category.value = product.category;
            form.elements.features.value = product.features.join('\n');
            form.elements.images.value = product.images.join('\n');
            form.dataset.productId = product.id;
        } else {
            form.reset();
            delete form.dataset.productId;
        }

        // Add active class for animation
        requestAnimationFrame(() => {
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('active'), 10);
        });
    }

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    saveProduct() {
        const form = document.getElementById('product-form');
        const productData = {
            name: form.elements.name.value,
            shortDescription: form.elements.shortDescription.value,
            fullDescription: form.elements.fullDescription.value,
            price: parseFloat(form.elements.price.value),
            badge: form.elements.badge.value || null,
            category: form.elements.category.value,
            features: form.elements.features.value.split('\n').filter(f => f.trim()),
            images: form.elements.images.value.split('\n').filter(i => i.trim())
        };

        if (form.dataset.productId) {
            // Update existing product
            productData.id = parseInt(form.dataset.productId);
            this.updateProduct(productData);
        } else {
            // Add new product
            productData.id = Math.max(...products.map(p => p.id)) + 1;
            this.addProduct(productData);
        }

        this.closeProductModal();
        this.loadProducts();
    }

    addProduct(productData) {
        products.push(productData);
        // Here you would typically save to a backend
    }

    updateProduct(productData) {
        const index = products.findIndex(p => p.id === productData.id);
        if (index !== -1) {
            products[index] = productData;
            // Here you would typically save to a backend
        }
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products.splice(index, 1);
                this.loadProducts();
                // Here you would typically save to a backend
            }
        }
    }

    editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    quickUpdatePrice(productId, newPrice) {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.price = parseFloat(newPrice);
            // Here you would typically save to backend
            this.loadProducts(); // Refresh the display
            
            // Show success message
            this.showNotification('Price updated successfully!', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    handleError(error, message = 'An error occurred') {
        console.error(error);
        this.showNotification(message, 'error');
    }
}

// Initialize the dashboard
const adminDashboard = new AdminDashboard(); 