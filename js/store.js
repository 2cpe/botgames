document.addEventListener('DOMContentLoaded', async function() {
    const storeGrid = document.querySelector('.store-grid');
    
    try {
        // Updated path to config.json
        const response = await fetch('./config.json');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        const products = data.products;
        
        // Render all products
        storeGrid.innerHTML = products.map(product => 
            ProductRenderer.renderProductCard(product)
        ).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        storeGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}); 