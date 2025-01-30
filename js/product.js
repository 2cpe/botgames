document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        // Fetch the config file
        const response = await fetch('./js/config.json');
        const config = await response.json();
        
        // Find the product
        const product = config.products.find(p => p.id === productId);
        
        if (product) {
            // Update page title
            document.title = `${product.name} - ${config.store.name}`;
            
            // Render product details
            const productDetail = document.querySelector('.product-detail');
            productDetail.innerHTML = ProductRenderer.renderProductDetail(product);
            
            // Setup thumbnail handling
            const thumbnails = document.querySelectorAll('.thumbnail-grid img');
            const mainImage = document.getElementById('mainImage');

            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = this.src;
                        mainImage.style.opacity = '1';
                    }, 300);

                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            // Update Discord links
            const discordLinks = document.querySelectorAll('.discord-link, .buy-now-btn');
            discordLinks.forEach(link => {
                link.href = config.store.discordInvite;
            });
        } else {
            // Handle product not found
            window.location.href = 'store.html';
        }
    } catch (error) {
        console.error('Error loading product:', error);
        document.querySelector('.product-detail').innerHTML = 
            '<p class="error-message">Error loading product details. Please try again later.</p>';
    }

    // Add smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}); 