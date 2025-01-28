document.addEventListener('DOMContentLoaded', function() {
    const storeGrid = document.querySelector('.store-grid');
    
    // Render all products
    storeGrid.innerHTML = products.map(product => 
        ProductRenderer.renderProductCard(product)
    ).join('');
}); 