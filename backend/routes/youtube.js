import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/youtube/download
 * Download video from YouTube using yt-dlp
 */
router.post('/download', async (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                status: 'error',
                message: 'YouTube URL is required',
            });
        }

        // Validate YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(url)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid YouTube URL',
            });
        }

        console.log('Starting YouTube download for:', url);

        const fileId = uuidv4();
        const uploadDir = path.join(__dirname, '../uploads');
        const ytDlpPath = path.join(__dirname, '../yt-dlp.exe');
        const outputTemplate = path.join(uploadDir, `${fileId}.%(ext)s`);

        // Ensure upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Get video info first
        console.log('Fetching video info...');
        const infoCommand = `"${ytDlpPath}" --dump-json --no-playlist "${url}"`;
        const { stdout: infoJson } = await execPromise(infoCommand);
        const videoInfo = JSON.parse(infoJson);

        const title = videoInfo.title || 'YouTube Video';
        const duration = videoInfo.duration || 0;

        console.log('Video info:', { title, duration });

        // Download video - prefer mp4 format
        console.log('Starting download...');
        const downloadCommand = `"${ytDlpPath}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputTemplate}" --no-playlist "${url}"`;

        await execPromise(downloadCommand, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer

        console.log('Download complete');

        // Find the actual downloaded file
        const files = await fs.readdir(uploadDir);
        const downloadedFile = files.find(f => f.startsWith(fileId));

        if (!downloadedFile) {
            throw new Error('Downloaded file not found');
        }

        const actualPath = path.join(uploadDir, downloadedFile);
        const finalPath = path.join(uploadDir, `${fileId}.mp4`);

        // Rename to .mp4 if needed
        if (actualPath !== finalPath) {
            await fs.rename(actualPath, finalPath);
        }

        console.log('Video saved as:', `${fileId}.mp4`);

        res.json({
            status: 'ok',
            fileId,
            videoUrl: `/uploads/${fileId}.mp4`,
            title,
            duration,
            message: 'Video downloaded successfully from YouTube',
        });

    } catch (error) {
        console.error('YouTube download error:', error);

        // Provide more specific error messages
        let message = 'Failed to download video from YouTube';

        if (error.message?.includes('yt-dlp') || error.message?.includes('ENOENT')) {
            message = 'yt-dlp is not installed. Please run: node install-ytdlp.js';
        } else if (error.stderr?.includes('Video unavailable')) {
            message = 'This video is unavailable or private';
        } else if (error.stderr?.includes('Sign in')) {
            message = 'This video requires authentication';
        } else if (error.message) {
            message = error.message;
        }

        res.status(500).json({
            status: 'error',
            message,
        });
    }
});

export default router;
