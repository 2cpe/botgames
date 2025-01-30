class SteganographyUtil {
    static async hideToken(imageElement, token) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        
        // Draw image to canvas
        ctx.drawImage(imageElement, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert token to binary
        const binaryToken = token.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');
        
        // Hide token length first (32 bits)
        const tokenLength = binaryToken.length;
        const binaryLength = tokenLength.toString(2).padStart(32, '0');
        
        // Hide data in least significant bits
        let bitIndex = 0;
        
        // Hide length
        for(let i = 0; i < 32; i++) {
            data[i * 4] = (data[i * 4] & 254) | parseInt(binaryLength[i]);
        }
        
        // Hide token
        for(let i = 0; i < binaryToken.length; i++) {
            data[(i + 32) * 4] = (data[(i + 32) * 4] & 254) | parseInt(binaryToken[i]);
        }
        
        // Put modified data back
        ctx.putImageData(imageData, 0, 0);
        
        return canvas.toDataURL();
    }
    
    static async extractToken(imageElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        
        ctx.drawImage(imageElement, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract length first
        let binaryLength = '';
        for(let i = 0; i < 32; i++) {
            binaryLength += data[i * 4] & 1;
        }
        
        const tokenLength = parseInt(binaryLength, 2);
        
        // Extract token
        let binaryToken = '';
        for(let i = 0; i < tokenLength; i++) {
            binaryToken += data[(i + 32) * 4] & 1;
        }
        
        // Convert binary back to string
        let token = '';
        for(let i = 0; i < binaryToken.length; i += 8) {
            token += String.fromCharCode(parseInt(binaryToken.substr(i, 8), 2));
        }
        
        return token;
    }
} 