class AdminDashboard {
    async initialize() {
        this.api = new APIHandler();
        await this.api.initialize();
        this.initializeEventListeners();
        await this.loadProducts();
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
            console.log('Loading products...');
            const products = await this.api.fetchProducts();
            window.products = products; // Update global products
            
            const productsGrid = document.querySelector('.products-grid');
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
            console.log('Products loaded:', products.length);
        } catch (error) {
            console.error('Failed to load products:', error);
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

    async addProduct(productData) {
        try {
            products.push(productData);
            await this.api.updateProducts(products);
            this.showNotification('Product added successfully!', 'success');
            await this.loadProducts(); // Reload to show updated data
        } catch (error) {
            console.error('Failed to add product:', error);
            this.showNotification('Failed to add product. Please try again.', 'error');
            await this.loadProducts(); // Reload to ensure consistency
        }
    }

    async updateProduct(productData) {
        try {
            const index = products.findIndex(p => p.id === productData.id);
            if (index !== -1) {
                products[index] = productData;
                await this.api.updateProducts(products);
                this.showNotification('Product updated successfully!', 'success');
                await this.loadProducts(); // Reload to show updated data
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            this.showNotification('Failed to update product. Please try again.', 'error');
            await this.loadProducts(); // Reload to ensure consistency
        }
    }

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const index = products.findIndex(p => p.id === productId);
                if (index !== -1) {
                    products.splice(index, 1);
                    await this.api.updateProducts(products);
                    this.loadProducts();
                    this.showNotification('Product deleted successfully!', 'success');
                }
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
            const product = products.find(p => p.id === productId);
            if (product) {
                product.price = parseFloat(newPrice);
                await this.api.updateProducts(products);
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

// Initialize when everything is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.adminDashboard = new AdminDashboard();
        await window.adminDashboard.initialize();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
}); 