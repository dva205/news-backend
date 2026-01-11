import multer from 'multer';
import { imageFilter } from '../utils/imageFilter.js';


// Cấu hình storage
const storage = multer.memoryStorage();

// Export multer instance
export const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Max 5MB
    },
    fileFilter: imageFilter
});
