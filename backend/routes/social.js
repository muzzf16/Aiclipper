import express from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory token storage (Use a database in production)
const tokens = {};

// YouTube OAuth Configuration
const youtubeConfig = {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/social/oauth/callback',
};

const oauth2Client = new google.auth.OAuth2(
    youtubeConfig.clientId,
    youtubeConfig.clientSecret,
    youtubeConfig.redirectUri
);

/**
 * GET /api/social/oauth/:platform
 * Get OAuth URL for social media platform
 */
router.get('/oauth/:platform', async (req, res, next) => {
    try {
        const { platform } = req.params;

        if (platform === 'youtube') {
            const scopes = [
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube.readonly'
            ];

            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                state: 'youtube', // Pass platform as state
                include_granted_scopes: true
            });

            return res.json({
                status: 'ok',
                authUrl,
            });
        }

        // TODO: Implement TikTok and Instagram
        if (['tiktok', 'instagram'].includes(platform)) {
            return res.json({
                status: 'ok',
                authUrl: `#oauth-${platform}`, // Keep simulation for others for now
                message: `${platform} OAuth not yet implemented`,
            });
        }

        return res.status(400).json({
            status: 'error',
            message: 'Invalid platform',
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/social/oauth/callback
 * Handle OAuth callback
 */
router.get('/oauth/callback', async (req, res, next) => {
    try {
        const { code, state } = req.query; // state contains the platform

        if (state === 'youtube') {
            const { tokens: newTokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(newTokens);

            // Store tokens (in-memory for now)
            tokens['youtube'] = newTokens;

            // Return HTML that closes the popup and notifies the opener
            const html = `
                <html>
                    <body>
                        <h1>Authentication Successful</h1>
                        <p>You can close this window now.</p>
                        <script>
                            window.opener.postMessage({ type: 'oauth_success', platform: 'youtube' }, '*');
                            window.close();
                        </script>
                    </body>
                </html>
            `;
            return res.send(html);
        }

        res.status(400).send('Invalid platform state');

    } catch (error) {
        console.error('OAuth Callback Error:', error);
        res.status(500).send('Authentication failed');
    }
});

/**
 * POST /api/social/upload/:platform
 * Upload clip to social media platform
 */
router.post('/upload/:platform', async (req, res, next) => {
    try {
        const { platform } = req.params;
        const { filePath, title, caption, tags } = req.body;

        if (!filePath || !title) {
            return res.status(400).json({
                status: 'error',
                message: 'filePath and title are required',
            });
        }

        if (platform === 'youtube') {
            if (!tokens['youtube']) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Not authenticated with YouTube. Please connect first.',
                });
            }

            oauth2Client.setCredentials(tokens['youtube']);
            const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

            // Construct absolute path to file
            // Assuming filePath is the fileId/filename in the uploads directory
            const uploadDir = path.join(__dirname, '../uploads');
            const videoPath = path.join(uploadDir, filePath.endsWith('.mp4') ? filePath : `${filePath}.mp4`);

            if (!fs.existsSync(videoPath)) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Video file not found',
                });
            }

            const fileSize = fs.statSync(videoPath).size;

            const resUpload = await youtube.videos.insert({
                part: 'snippet,status',
                requestBody: {
                    snippet: {
                        title,
                        description: `${caption}\n\nTags: ${tags.join(', ')}`,
                        tags: tags,
                    },
                    status: {
                        privacyStatus: 'private', // Default to private for safety
                        selfDeclaredMadeForKids: false,
                    },
                },
                media: {
                    body: fs.createReadStream(videoPath),
                },
            }, {
                // Use the underlying axios instance to track progress if needed
                onUploadProgress: evt => {
                    const progress = (evt.bytesRead / fileSize) * 100;
                    // console.log(`${Math.round(progress)}% complete`);
                },
            });

            return res.json({
                success: true,
                platform: 'youtube',
                postUrl: `https://youtu.be/${resUpload.data.id}`,
                postId: resUpload.data.id,
                message: 'Uploaded to YouTube successfully!',
            });
        }

        // Simulation for other platforms
        if (['tiktok', 'instagram'].includes(platform)) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.json({
                success: true,
                platform,
                postUrl: `https://${platform}.com/post/simulated`,
                message: `Upload to ${platform} simulated successfully.`,
            });
        }

        res.status(400).json({
            status: 'error',
            message: 'Invalid platform',
        });

    } catch (error) {
        console.error('Upload Error:', error);
        next(error);
    }
});

export default router;
