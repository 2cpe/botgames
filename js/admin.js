class AdminDashboard {
    constructor() {
        if (!window.dbHandler) {
            throw new Error('Database handler not initialized');
        }
        if (!window.apiHandler) {
            throw new Error('API handler not initialized');
        }

        this.initializeEventListeners();
        this.loadProducts().catch(error => {
            console.error('Failed to load products:', error);
            this.handleError(error);
        });
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

    async loadProducts() {
        try {
            const productsGrid = document.querySelector('.products-grid');
            const products = await apiHandler.fetchProducts();
            
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
                    <button onclick="adminDashboard.quickUpdatePrice(${product.id}, document.getElementById('quick-price-${product.id}').value)">
                        <i class="fas fa-save"></i>
                    </button>
                </div>
                <h3>${product.name}</h3>
                <p>${product.shortDescription}</p>
                <div class="price">$${product.price}</div>
                <div class="product-status">
                    <span class="badge ${product.badge ? 'badge-' + product.badge.toLowerCase() : ''}">${product.badge || 'No Badge'}</span>
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
            // Fill form with product data
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

        modal.style.display = 'block';
    }

    closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
    }

    async saveProduct() {
        try {
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
                await this.updateProduct(form.dataset.productId, productData);
            } else {
                await this.addProduct(productData);
            }

            this.closeProductModal();
            this.loadProducts();
        } catch (error) {
            this.handleError(error, 'Failed to save product');
        }
    }

    async addProduct(productData) {
        try {
            await apiHandler.addProduct(productData);
            this.showNotification('Product added successfully!', 'success');
        } catch (error) {
            this.handleError(error, 'Failed to add product');
        }
    }

    async updateProduct(productId, productData) {
        try {
            await apiHandler.updateProduct(productId, productData);
            this.showNotification('Product updated successfully!', 'success');
        } catch (error) {
            this.handleError(error, 'Failed to update product');
        }
    }

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await apiHandler.deleteProduct(productId);
                this.loadProducts();
                this.showNotification('Product deleted successfully!', 'success');
            } catch (error) {
                this.handleError(error, 'Failed to delete product');
            }
        }
    }

    editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    async quickUpdatePrice(productId, newPrice) {
        try {
            const product = await dbHandler.getProduct(productId);
            if (product) {
                await dbHandler.updateProduct(productId, {
                    ...product,
                    price: parseFloat(newPrice)
                });
                this.loadProducts();
                this.showNotification('Price updated successfully!', 'success');
            }
        } catch (error) {
            this.handleError(error, 'Failed to update price');
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

// Initialize dashboard when everything is ready
function initDashboard() {
    if (window.dbHandler && window.apiHandler) {
        try {
            window.adminDashboard = new AdminDashboard();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            // Retry after a short delay
            setTimeout(initDashboard, 1000);
        }
    } else {
        // Wait for handlers to be ready
        setTimeout(initDashboard, 100);
    }
}

// Start initialization after DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 