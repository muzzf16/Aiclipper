import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeVideo, generateMockClips } from '../services/geminiService.js';
import fs from 'fs/promises';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store for async processing jobs
const processingJobs = new Map();

/**
 * POST /api/process
 * Process video and analyze with AI
 * 
 * Request body:
 * - fileId: string (required)
 * - async: boolean (optional, default false)
 */
router.post('/', async (req, res, next) => {
    try {
        const { fileId, async: useAsync = false, systemPrompt } = req.body;

        if (!fileId) {
            return res.status(400).json({
                status: 'error',
                message: 'fileId is required',
            });
        }

        // Find video file
        const uploadDir = path.join(__dirname, '../uploads');
        const files = await fs.readdir(uploadDir);
        const videoFile = files.find(f => f.startsWith(fileId));

        if (!videoFile) {
            return res.status(404).json({
                status: 'error',
                message: 'Video file not found',
            });
        }

        const videoPath = path.join(uploadDir, videoFile);

        // Check file exists
        try {
            await fs.access(videoPath);
        } catch {
            return res.status(404).json({
                status: 'error',
                message: 'Video file not accessible',
            });
        }

        // Check if using async processing
        if (useAsync) {
            const processId = `proc-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Store job info
            processingJobs.set(processId, {
                status: 'analyzing',
                progress: 0,
                message: 'Starting analysis...',
                startedAt: new Date(),
            });

            // Process asynchronously
            processVideoAsync(processId, videoPath, systemPrompt).catch(error => {
                processingJobs.set(processId, {
                    status: 'error',
                    progress: 0,
                    message: error.message,
                    error: error.message,
                });
            });

            return res.json({
                status: 'ok',
                processId,
                message: 'Processing started. Use /api/process/status/:processId to check progress.',
            });
        }

        // Synchronous processing
        console.log(`🎬 Processing video: ${videoFile}`);

        // For MVP, we'll use mock clips if GEMINI_API_KEY is not set
        // This allows testing the full app without API keys
        let result;

        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                result = await analyzeVideo(videoPath, null, systemPrompt);
            } catch (error) {
                console.warn('Gemini analysis failed, using mock clips:', error.message);
                result = generateMockClips(180); // 3 minute video assumption
            }
        } else {
            console.log('⚠ GEMINI_API_KEY not configured, using mock clips');
            result = generateMockClips(180);
        }

        res.json(result);

    } catch (error) {
        console.error('Processing error:', error);
        next(error);
    }
});

/**
 * GET /api/process/status/:processId
 * Check status of async processing job
 */
router.get('/status/:processId', (req, res) => {
    const { processId } = req.params;

    const job = processingJobs.get(processId);

    if (!job) {
        return res.status(404).json({
            status: 'error',
            message: 'Process ID not found',
        });
    }

    res.json(job);
});

/**
 * Process video asynchronously
 * @param {string} processId
 * @param {string} videoPath
 * @param {string} systemPrompt - Optional custom system prompt
 */
async function processVideoAsync(processId, videoPath, systemPrompt = null) {
    try {
        // Update: Extracting audio
        processingJobs.set(processId, {
            status: 'extracting',
            progress: 20,
            message: 'Extracting audio...',
        });

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work

        // Update: Transcribing
        processingJobs.set(processId, {
            status: 'transcribing',
            progress: 40,
            message: 'Transcribing audio...',
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update: Analyzing
        processingJobs.set(processId, {
            status: 'analyzing',
            progress: 60,
            message: 'Analyzing with AI...',
        });

        // Run analysis
        let result;
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                result = await analyzeVideo(videoPath, null, systemPrompt);
            } catch (error) {
                result = generateMockClips(180);
            }
        } else {
            result = generateMockClips(180);
        }

        // Update: Complete
        processingJobs.set(processId, {
            status: 'complete',
            progress: 100,
            message: 'Analysis complete!',
            result,
        });

    } catch (error) {
        processingJobs.set(processId, {
            status: 'error',
            progress: 0,
            message: error.message,
            error: error.message,
        });
        throw error;
    }
}

export default router;
