document.addEventListener('DOMContentLoaded', async function() {
    const api = new APIHandler();
    const storeGrid = document.querySelector('.store-grid');
    
    try {
        const products = await api.fetchProducts();
        
        if (!products || products.length === 0) {
            storeGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products available at the moment.</p>
                </div>
            `;
            return;
        }
        
        storeGrid.innerHTML = products.map(product => 
            ProductRenderer.renderProductCard(product)
        ).join('');
    } catch (error) {
        console.error('Failed to load products:', error);
        storeGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}); 