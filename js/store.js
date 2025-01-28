document.addEventListener('DOMContentLoaded', async function() {
    try {
        const storeGrid = document.querySelector('.store-grid');
        const products = await dbHandler.getAllProducts();
        
        if (!products || !products.length) {
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
        // Show error message to user
    }
}); 