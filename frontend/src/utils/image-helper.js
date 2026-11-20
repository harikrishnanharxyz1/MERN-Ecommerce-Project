import { assets } from '../assets/assets.js';

/**
 * Resolves product image source to handle:
 * 1. Vite-bundled asset imports
 * 2. Static backend paths like '/images/black.png'
 * 3. Asset keys matching frontend assets dictionary
 * 4. Full external URLs
 */
export function resolveProductImage(image) {
  if (!image) return '';

  // If already imported asset (e.g. from assets.js)
  if (typeof image === 'object') return image;

  // If it's an asset key in assets object directly
  if (assets[image]) {
    return assets[image];
  }

  // If it's a path like '/images/black.png' or 'images/black.png'
  if (typeof image === 'string' && image.includes('/images/')) {
    const filename = image.split('/').pop();
    const assetKey = filename.replace(/\.[^/.]+$/, ''); // remove extension
    if (assets[assetKey]) {
      return assets[assetKey];
    }
    // If not found in local assets, use backend URL
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
    return `${backendUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  }

  // If it's a full URL
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image;
  }

  return image;
}
