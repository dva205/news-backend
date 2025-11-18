import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { imageFilter } from '../helpers/imageFilter.js';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tuyệt đối đến folder image
const uploadDir = path.join(__dirname, '../../image');

// Tự động tạo folder nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created image directory');
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user?.id || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Lấy extension: .jpg, .png...
        cb(null, `${file.fieldname}-${userId}-${uniqueSuffix}${ext}`);
    }
});

// Export multer instance
export const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Max 5MB
    },
    fileFilter: imageFilter // Import từ helper
});
