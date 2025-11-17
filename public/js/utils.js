// TG Controller - Optimized Utilities

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Simple cache implementation
 */
class SimpleCache {
    constructor(ttl = 300000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        // Check if expired
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
    }
}

// Global cache instances
const apiCache = new SimpleCache(300000); // 5 minutes
const imageCache = new SimpleCache(3600000); // 1 hour

/**
 * Fetch with caching
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {boolean} useCache - Whether to use cache
 * @returns {Promise} Fetch promise
 */
async function cachedFetch(url, options = {}, useCache = true) {
    const cacheKey = url + JSON.stringify(options);
    
    // Check cache first
    if (useCache && apiCache.has(cacheKey)) {
        return apiCache.get(cacheKey);
    }
    
    // Fetch from server
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Cache successful responses
    if (response.ok && useCache) {
        apiCache.set(cacheKey, data);
    }
    
    return data;
}

/**
 * Lazy load images
 * @param {string} selector - CSS selector for images
 */
function lazyLoadImages(selector = 'img[data-src]') {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll(selector).forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll(selector).forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Show loading skeleton
 * @param {string} elementId - Element ID to show skeleton in
 * @param {number} count - Number of skeleton items
 */
function showSkeleton(elementId, count = 3) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const skeletons = Array(count).fill(0).map(() => `
        <div class="skeleton" style="height: 80px; margin-bottom: 15px;"></div>
    `).join('');
    
    element.innerHTML = skeletons;
}

/**
 * Show loading spinner
 * @param {string} elementId - Element ID to show spinner in
 * @param {string} message - Optional loading message
 */
function showSpinner(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="spinner" style="margin: 0 auto 20px;"></div>
            <div style="color: #666;">${message}</div>
        </div>
    `;
}

/**
 * Format time ago
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted time string
 */
function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return interval === 1 
                ? `1 ${name} ago` 
                : `${interval} ${name}s ago`;
        }
    }
    
    return 'Just now';
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type: success, error, info
 */
function showToast(message, type = 'info') {
    const colors = {
        success: '#10ac84',
        error: '#ff4757',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animations
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Preload critical resources
 */
function preloadResources() {
    // Preload critical API endpoints
    const criticalEndpoints = ['/api/user', '/api/bots'];
    
    criticalEndpoints.forEach(endpoint => {
        fetch(endpoint, { method: 'HEAD' }).catch(() => {});
    });
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    preloadResources();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        SimpleCache,
        cachedFetch,
        lazyLoadImages,
        showSkeleton,
        showSpinner,
        timeAgo,
        formatNumber,
        copyToClipboard,
        showToast,
        apiCache,
        imageCache
    };
}
