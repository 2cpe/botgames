document.addEventListener('DOMContentLoaded', async function() {
    const storeGrid = document.querySelector('.store-grid');
    
    try {
        // Fetch the config file
        const response = await fetch('./js/config.json');
        const config = await response.json();
        
        // Update store name if needed
        document.title = config.store.name;
        
        // Render all products
        storeGrid.innerHTML = config.products.map(product => 
            ProductRenderer.renderProductCard(product)
        ).join('');
        
        // Update Discord links
        const discordLinks = document.querySelectorAll('.discord-link');
        discordLinks.forEach(link => {
            link.href = config.store.discordInvite;
        });
    } catch (error) {
        console.error('Error loading products:', error);
        storeGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
    }
}); 