document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Find the product
    const product = products.find(p => p.id === productId);
    
    if (product) {
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
    } else {
        // Handle product not found
        window.location.href = 'store.html';
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