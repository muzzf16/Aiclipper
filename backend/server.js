import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { WebSocketServer } from 'ws';

// Load environment variables
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import uploadRouter from './routes/upload.js';
import youtubeRouter from './routes/youtube.js';
import processRouter from './routes/process.js';
import socialRouter from './routes/social.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/process', processRouter);
app.use('/api/social', socialRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Video Clipper API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 'error',
            message: `File upload error: ${err.message}`,
        });
    }

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
    });
});

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${path.resolve(UPLOAD_DIR)}`);
});

// WebSocket server for async processing updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('📡 WebSocket client connected');

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });

    ws.on('close', () => {
        console.log('📡 WebSocket client disconnected');
    });
});

// Export WebSocket server for use in routes
export { wss };

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
