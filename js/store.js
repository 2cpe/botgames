document.addEventListener('DOMContentLoaded', async function() {
    const storeGrid = document.querySelector('.store-grid');
    
    // Get products from backend or fall back to local storage
    let currentProducts;
    try {
        currentProducts = await ProductManager.getProducts();
    } catch (error) {
        currentProducts = JSON.parse(localStorage.getItem('products')) || products;
    }
    
    // Render all products
    storeGrid.innerHTML = currentProducts.map(product => 
        ProductRenderer.renderProductCard(product)
    ).join('');
}); 