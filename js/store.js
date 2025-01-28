document.addEventListener('DOMContentLoaded', function() {
    // Load products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const storeGrid = document.querySelector('.store-grid');
    
    if (storedProducts.length === 0) {
        storeGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No products available at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Render all products
    storeGrid.innerHTML = storedProducts.map(product => 
        ProductRenderer.renderProductCard(product)
    ).join('');
}); 