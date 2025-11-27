import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const router = express.Router();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        const filename = `${uniqueId}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, MOV, AVI, and WebM videos are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB default
    },
});

/**
 * POST /api/upload
 * Upload a local video file
 */
router.post('/', upload.single('video'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No video file provided',
            });
        }

        const fileId = path.parse(req.file.filename).name; // UUID without extension
        const videoUrl = `/uploads/${req.file.filename}`;

        res.json({
            status: 'ok',
            fileId,
            filename: req.file.originalname,
            size: req.file.size,
            videoUrl,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/upload/files
 * List all uploaded files
 */
router.get('/files', async (req, res, next) => {
    try {
        const uploadDir = path.join(__dirname, '../uploads');
        const files = await fs.readdir(uploadDir);

        const fileList = files
            .filter(f => !f.startsWith('.'))
            .map(filename => ({
                fileId: path.parse(filename).name,
                filename,
            }));

        res.json({
            status: 'ok',
            files: fileList,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
