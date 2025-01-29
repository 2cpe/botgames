document.addEventListener('DOMContentLoaded', function() {
    const storeGrid = document.querySelector('.store-grid');
    
    // Get products from localStorage or fall back to default products
    const currentProducts = JSON.parse(localStorage.getItem('products')) || products;
    
    // Render all products
    storeGrid.innerHTML = currentProducts.map(product => 
        ProductRenderer.renderProductCard(product)
    ).join('');
}); 