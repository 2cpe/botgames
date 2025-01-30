document.addEventListener('DOMContentLoaded', function() {
    const storeGrid = document.querySelector('.store-grid');
    
    try {
        // Update store name if needed
        document.title = storeConfig.store.name;
        
        // Render all products
        storeGrid.innerHTML = storeConfig.products.map(product => 
            ProductRenderer.renderProductCard(product)
        ).join('');
        
        // Update Discord links
        const discordLinks = document.querySelectorAll('.discord-link');
        discordLinks.forEach(link => {
            link.href = storeConfig.store.discordInvite;
        });
    } catch (error) {
        console.error('Error loading products:', error);
        storeGrid.innerHTML = `<p class="error-message">Error loading products. Please try again later.<br>Error: ${error.message}</p>`;
    }
}); 