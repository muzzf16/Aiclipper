import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System prompt for video analysis
 */
const SYSTEM_PROMPT = `You are an expert video editor specializing in detecting high-impact moments for short-form content such as YouTube Shorts or TikTok. Analyze the video transcript and identify the most engaging, viral-potential highlight segments. Return results strictly in valid JSON format.

GOAL:
Extract the best short-form content moments based on engagement, emotional intensity, important statements, jokes, reactions, or key learning points.

OUTPUT JSON SCHEMA:
{
  "clips": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "start": "MM:SS",
      "end": "MM:SS",
      "viralityScore": number (0-10),
      "transcript": [ {"start": "MM:SS", "end": "MM:SS", "text": "string"} ]
    }
  ]
}

RULES:
- Use concise clip titles
- Scores must reflect objective excitement
- Do NOT include any text outside JSON
- Do NOT comment or explain anything
- Start/end must align with natural speech boundaries
- Generate 3-7 clips per video
- Each clip should be 15-60 seconds long
- viralityScore should be realistic (most clips 4-8, exceptional ones 9-10)`;

/**
 * Analyze video with Gemini AI
 * @param {string} videoPath - Path to the video file
 * @param {string} transcript - Optional transcript text
 * @param {string} customPrompt - Optional custom system prompt
 * @returns {Promise<Object>} Analysis result with clips
 */
export async function analyzeVideo(videoPath, transcript = null, customPrompt = null) {
    try {
        console.log('🤖 Starting Gemini AI analysis...');
        console.log('📹 Video path:', videoPath);
        console.log('🔑 API Key used:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.4,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });

        // Read video file
        const videoData = await fs.readFile(videoPath);
        const videoBase64 = videoData.toString('base64');

        // Prepare request - use custom prompt if provided
        const promptToUse = customPrompt || SYSTEM_PROMPT;
        const parts = [
            {
                inlineData: {
                    mimeType: 'video/mp4',
                    data: videoBase64,
                },
            },
            {
                text: promptToUse + (transcript ? `\n\nTRANSCRIPT:\n${transcript}` : ''),
            },
        ];

        console.log('📤 Sending request to Gemini AI...');

        // Generate content
        const result = await model.generateContent(parts);
        const response = result.response;
        const text = response.text();

        console.log('📥 Received response from Gemini');
        console.log('Response preview:', text.substring(0, 200));

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in Gemini response');
        }

        const analysisResult = JSON.parse(jsonMatch[0]);

        // Validate clips structure
        if (!analysisResult.clips || !Array.isArray(analysisResult.clips)) {
            throw new Error('Invalid clips structure in response');
        }

        // Add unique IDs if not present
        analysisResult.clips = analysisResult.clips.map((clip, index) => ({
            ...clip,
            id: clip.id || `clip-${index + 1}`,
        }));

        console.log(`✅ Analysis complete: ${analysisResult.clips.length} clips found`);

        return {
            status: 'ok',
            clips: analysisResult.clips,
        };

    } catch (error) {
        console.error('❌ Gemini analysis error:', error);

        if (error.message.includes('API key')) {
            throw new Error('Invalid Gemini API key. Please check your .env file.');
        }

        if (error.message.includes('quota')) {
            throw new Error('Gemini API quota exceeded. Please try again later.');
        }

        throw new Error(`AI analysis failed: ${error.message}`);
    }
}

/**
 * Generate mock clips for testing without Gemini API
 * @param {number} duration - Video duration in seconds
 * @returns {Object} Mock analysis result
 */
export function generateMockClips(duration = 300) {
    const numClips = Math.min(5, Math.floor(duration / 60));
    const clips = [];

    for (let i = 0; i < numClips; i++) {
        const startSeconds = Math.floor((duration / numClips) * i);
        const endSeconds = Math.min(startSeconds + Math.floor(20 + Math.random() * 40), duration);

        const start = `${Math.floor(startSeconds / 60).toString().padStart(2, '0')}:${(startSeconds % 60).toString().padStart(2, '0')}`;
        const end = `${Math.floor(endSeconds / 60).toString().padStart(2, '0')}:${(endSeconds % 60).toString().padStart(2, '0')}`;

        clips.push({
            id: `clip-${i + 1}`,
            title: `Highlight Moment ${i + 1}`,
            summary: `This is an engaging moment from the video that could go viral.`,
            start,
            end,
            viralityScore: 5 + Math.random() * 4,
            transcript: [
                {
                    start,
                    end,
                    text: 'Sample transcript for this highlight moment.',
                },
            ],
        });
    }

    return {
        status: 'ok',
        clips,
    };
}

// Export SYSTEM_PROMPT for use as template in frontend
export { SYSTEM_PROMPT };
