document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const token = localStorage.getItem('discord_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Verify user has required role
    try {
        const user = await validateUser(token);
        if (!user.hasRequiredRole) {
            showNotification('Access denied. Insufficient permissions.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
        return;
    }

    let currentProducts = [];
    let currentEditingId = null;

    // Load products on page load
    loadProducts();

    // Add Product Button Handler
    document.getElementById('addProductBtn').addEventListener('click', () => {
        currentEditingId = null;
        document.getElementById('editProductForm').reset();
        updateFormState();
    });

    // Form Submit Handler
    document.getElementById('editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productData = {
            id: currentEditingId || Date.now(), // Use existing ID or create new one
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            badge: formData.get('badge'),
            shortDescription: formData.get('shortDescription'),
            fullDescription: formData.get('fullDescription'),
            features: formData.get('features').split('\n').filter(f => f.trim()),
            images: formData.get('images').split('\n').filter(i => i.trim()),
            technicalDetails: {
                version: formData.get('version'),
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                framework: formData.get('framework'),
                filesIncluded: formData.get('filesIncluded')
            }
        };

        try {
            const response = await fetch('./config.json');
            const data = await response.json();
            
            if (currentEditingId) {
                // Update existing product
                const index = data.products.findIndex(p => p.id === currentEditingId);
                if (index !== -1) {
                    data.products[index] = productData;
                }
            } else {
                // Add new product
                data.products.push(productData);
            }

            // Save to config.json
            await saveConfig(data);
            
            // Reload products
            await loadProducts();
            
            showNotification('Product saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Error saving product', 'error');
        }
    });

    // Delete Product Handler
    document.getElementById('deleteProductBtn').addEventListener('click', async () => {
        if (!currentEditingId) return;
        
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch('./config.json');
                const data = await response.json();
                
                data.products = data.products.filter(p => p.id !== currentEditingId);
                
                await saveConfig(data);
                await loadProducts();
                
                currentEditingId = null;
                document.getElementById('editProductForm').reset();
                updateFormState();
                
                showNotification('Product deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Error deleting product', 'error');
            }
        }
    });

    // Logout Button Handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('discord_token');
        window.location.href = 'login.html';
    });

    async function loadProducts() {
        try {
            const response = await fetch('./config.json');
            const data = await response.json();
            currentProducts = data.products;
            
            // Update products list
            const productsList = document.getElementById('productsList');
            productsList.innerHTML = currentProducts.map(product => `
                <div class="product-item ${product.id === currentEditingId ? 'active' : ''}" 
                     data-id="${product.id}">
                    <h3>${product.name}</h3>
                </div>
            `).join('');

            // Add click handlers to product items
            document.querySelectorAll('.product-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = parseInt(item.dataset.id);
                    loadProductToForm(productId);
                });
            });
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification('Error loading products', 'error');
        }
    }

    function loadProductToForm(productId) {
        const product = currentProducts.find(p => p.id === productId);
        if (!product) return;

        currentEditingId = productId;
        const form = document.getElementById('editProductForm');
        
        form.elements['name'].value = product.name;
        form.elements['price'].value = product.price;
        form.elements['category'].value = product.category;
        form.elements['badge'].value = product.badge || '';
        form.elements['shortDescription'].value = product.shortDescription;
        form.elements['fullDescription'].value = product.fullDescription;
        form.elements['features'].value = product.features.join('\n');
        form.elements['images'].value = product.images.join('\n');
        form.elements['version'].value = product.technicalDetails.version;
        form.elements['framework'].value = product.technicalDetails.framework;
        form.elements['filesIncluded'].value = product.technicalDetails.filesIncluded;

        updateFormState();
    }

    function updateFormState() {
        const deleteBtn = document.getElementById('deleteProductBtn');
        deleteBtn.style.display = currentEditingId ? 'flex' : 'none';
        
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.toggle('active', 
                parseInt(item.dataset.id) === currentEditingId);
        });
    }

    async function saveConfig(data) {
        try {
            const response = await fetch('./config.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, null, 4)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save config');
            }
        } catch (error) {
            throw new Error('Error saving config: ' + error.message);
        }
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async function validateUser(token) {
        try {
            const response = await fetch('https://discord.com/api/users/@me/guilds/1327745611230871572/member', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch user data:', await response.text());
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            console.log('User data:', userData); // For debugging
            const hasRequiredRole = userData.roles.includes('1327749769770307686');

            if (!hasRequiredRole) {
                console.log('User lacks required role. Roles:', userData.roles);
            }

            return {
                hasRequiredRole
            };
        } catch (error) {
            console.error('Validation error:', error);
            throw new Error('Failed to validate user');
        }
    }
}); 