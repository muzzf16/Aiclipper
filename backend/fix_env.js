import fs from 'fs';
import path from 'path';

const envContent = `PORT=5000
NODE_ENV=development

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyCSEt87B17C1rY-42QJoXHyLBOC0BT8JvM
YOUTUBE_API_KEY=your_youtube_api_key_here

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
MAX_ASYNC_FILE_SIZE=524288000

# Processing Configuration
WHISPER_MODEL_PATH=./models/whisper
ENABLE_TRANSCRIPTION=true

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
`;

fs.writeFileSync(path.join(process.cwd(), '.env'), envContent.trim());
console.log('.env file written successfully');
