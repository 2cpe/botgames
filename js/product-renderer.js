class ProductRenderer {
    static renderProductCard(product) {
        return `
            <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>${product.shortDescription}</p>
                    <div class="product-features">
                        ${product.features.slice(0, 3).map(feature => 
                            `<span><i class="fas fa-check"></i> ${feature}</span>`
                        ).join('')}
                    </div>
                    <div class="product-price">
                        <span class="price">$${product.price}</span>
                        <a href="product.html?id=${product.id}" class="buy-btn">View Details</a>
                    </div>
                </div>
            </div>
        `;
    }

    static renderProductDetail(product) {
        return `
            <div class="product-container">
                <div class="product-gallery">
                    <div class="main-image">
                        <img src="${product.images[0]}" alt="${product.name}" id="mainImage">
                    </div>
                    <div class="thumbnail-grid">
                        ${product.images.map((img, index) => `
                            <img src="${img}" alt="Thumbnail ${index + 1}" 
                                class="${index === 0 ? 'active' : ''}">
                        `).join('')}
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-header">
                        <span class="category-tag">${product.category}</span>
                        <h1>${product.name}</h1>
                        <div class="price-tag">$${product.price}</div>
                    </div>

                    <div class="product-description">
                        <h2>Description</h2>
                        <p>${product.fullDescription}</p>
                        
                        <div class="feature-list">
                            <h2>Features</h2>
                            <ul>
                                ${product.features.map(feature => `
                                    <li><i class="fas fa-check"></i> ${feature}</li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="technical-details">
                            <h2>Technical Details</h2>
                            <div class="details-grid">
                                ${Object.entries(product.technicalDetails).map(([key, value]) => `
                                    <div class="detail-item">
                                        <span class="label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span class="value">${value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="purchase-section">
                        <a href="https://discord.gg/your-discord" target="_blank" class="buy-now-btn">
                            <i class="fab fa-discord"></i>
                            Purchase via Discord
                        </a>
                        <div class="guarantee">
                            <i class="fas fa-shield-alt"></i>
                            <span>30-Day Money Back Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
} 