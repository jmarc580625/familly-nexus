// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Other configuration
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.gif'];
