// Performance optimization utilities

// Debounce function for API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// Cache implementation
class Cache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    const now = Date.now();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: now,
      expires: now + this.ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    if (now > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instances
export const apiCache = new Cache(50, 10 * 60 * 1000); // 10 minutes for API calls
export const computationCache = new Cache(100, 30 * 60 * 1000); // 30 minutes for computations

// Resource preloader
export const preloadResource = (href, as = 'script', crossorigin = null) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    
    link.onload = resolve;
    link.onerror = reject;
    
    document.head.appendChild(link);
  });
};

// Font optimization
export const optimizeFonts = () => {
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Teko:wght@300;400;500;600;700&display=swap'
  ];
  
  fontPreloads.forEach(font => {
    preloadResource(font, 'style', 'anonymous');
  });
};

// Image lazy loading with intersection observer
export const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// Efficient DOM updates
export const batchDOMUpdates = (callback) => {
  requestAnimationFrame(() => {
    callback();
  });
};

// Memory optimization
export const cleanupUnusedData = () => {
  // Clear expired cache entries
  apiCache.cache.forEach((value, key) => {
    if (Date.now() > value.expires) {
      apiCache.cache.delete(key);
    }
  });
  
  computationCache.cache.forEach((value, key) => {
    if (Date.now() > value.expires) {
      computationCache.cache.delete(key);
    }
  });
};

// Run cleanup every 5 minutes
setInterval(cleanupUnusedData, 5 * 60 * 1000);

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical images
  const criticalImages = [
    'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1634693654243-a4f03785cba4?w=300&h=400&fit=crop'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  optimizeFonts();
  preloadCriticalResources();
  
  // Setup intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    lazyLoadImages();
  }
  
  // Setup service worker for caching (if available)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silently fail if service worker registration fails
    });
  }
};