# 🎬 AI Video Clipper

Transform long-form videos into viral short-form content using AI-powered analysis.

![AI Video Clipper Banner](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Gemini](https://img.shields.io/badge/Gemini-AI-purple?style=for-the-badge&logo=google)

## ✨ Features

- **🎥 Multiple Input Sources**
  - Upload local video files (MP4, MOV, AVI, WebM)
  - Download directly from YouTube URLs
  
- **🤖 AI-Powered Analysis**
  - Gemini 2.0 Flash AI identifies viral-worthy moments
  - Automatic virality score calculation (0-10)
  - Smart clip detection based on engagement factors

- **📊 Intelligent Clip Management**
  - View all generated highlight clips
  - Real-time subtitle overlay
  - Clip boundary enforcement (automatic looping)
  - Vertical mode (9:16) for Shorts preview

- **🚀 Social Media Integration**
  - Upload directly to YouTube Shorts
  - TikTok upload support
  - Instagram Reels integration


- **⚡ Async Processing**
  - WebSocket support for large file processing
  - Real-time progress updates
  - Synchronous mode for smaller files (<50MB)

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Frontend (React + TypeScript) │
│   ├─ Video Upload & Preview      │
│   ├─ AI Analysis Interface       │
│   └─ Social Media Publishing     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Backend (Node.js + Express)   │
│   ├─ File Management             │
│   ├─ YouTube Download (yt-dlp)  │
│   ├─ AI Analysis (Gemini)       │
│   └─ Social Media APIs          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   External Services              │
│   ├─ Google Gemini AI           │
│   ├─ YouTube Data API           │
│   ├─ TikTok API                 │
│   └─ Instagram Graph API        │
└─────────────────────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **(Optional)** YouTube Data API key
- **(Optional)** yt-dlp for YouTube downloads
- **(Optional)** FFmpeg for audio extraction
- **(Optional)** Social media API credentials

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AiClipper
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173

# Optional: For YouTube downloads
YOUTUBE_API_KEY=your_youtube_api_key_here

# Optional: For social media uploads
TIKTOK_CLIENT_KEY=your_tiktok_key
INSTAGRAM_APP_ID=your_instagram_id
```

**Frontend (.env):**
```bash
cd frontend
# Already created with default values
```

### 4. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 Usage Guide

### Uploading a Video

1. **File Upload**
   - Drag and drop a video file (MP4, MOV, AVI, WebM)
   - Or click to browse and select a file
   - Max file size: 20MB for instant processing

2. **YouTube URL**
   - Click the "YouTube" tab
   - Paste a YouTube video URL
   - Click "Download" to fetch the video

### Analyzing with AI

1. Once video is loaded, click **"Analyze with AI"**
2. Wait for the AI analysis to complete (10-60 seconds)
3. View generated clips in the sidebar

### Viewing Clips

1. Click on any clip from the list
2. Video player will jump to the clip's timestamp
3. Playback automatically loops within clip boundaries
4. Subtitles display in real-time

### Publishing to Social Media

1. Select a clip from the list
2. Click on a social media platform (YouTube/TikTok/Instagram)
3. Fill in title, caption, and tags
4. Click "Upload" to publish

> **Note:** Social media uploads require OAuth authentication with each platform. See implementation notes in backend routes.

## 🛠️ Development

### Project Structure

```
AiClipper/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   └── package.json
│
└── backend/
    ├── routes/               # Express routes
    ├── services/             # Business logic
    ├── uploads/              # Uploaded videos
    ├── server.js             # Main server file
    └── package.json
```

### API Endpoints

#### Upload
- `POST /api/upload` - Upload local video file
- `GET /api/upload/files` - List uploaded files

#### YouTube
- `POST /api/youtube/download` - Download from YouTube

#### Processing
- `POST /api/process` - Analyze video (sync or async)
- `GET /api/process/status/:processId` - Check async job status

#### Social Media
- `GET /api/social/oauth/:platform` - Get OAuth URL
- `POST /api/social/upload/:platform` - Upload to platform

### Tech Stack

**Frontend:**
- React 19.2
- TypeScript
- TailwindCSS
- Vite
- Axios
- Lucide Icons

**Backend:**
- Node.js & Express
- Google Generative AI (Gemini)
- Multer (file uploads)
- WebSocket (async updates)
- UUID (unique IDs)

## ⚙️ Configuration

### File Size Limits

- **Instant Processing:** Files up to 20MB
- **Async Processing:** Files 20-50MB (with progress updates)
- **YouTube:** No size limits (recommended for large files)

### Gemini AI Settings

The Gemini service uses:
- Model: `gemini-2.0-flash-exp`
- Temperature: 0.4 (balanced creativity)
- Max tokens: 8192

You can adjust these in `backend/services/geminiService.js`

## 🔧 Troubleshooting

### Common Issues

**"Invalid Gemini API key"**
- Verify your `GEMINI_API_KEY` in `backend/.env`
- Get a key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**YouTube downloads not working**
- Install yt-dlp: `pip install yt-dlp`
- Or download from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)

**CORS errors**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default is `http://localhost:5173`

**Video not playing**
- Check file format (MP4 is most compatible)
- Ensure video file exists in `backend/uploads/`

**Mock clips appearing**
- This is normal if `GEMINI_API_KEY` is not configured
- Add a valid API key to use real AI analysis

## 🚧 Production Deployment

### Before deploying:

1. **Setup Real YouTube Downloads**
   - Install yt-dlp on the server
   - Uncomment implementation in `backend/routes/youtube.js`

2. **Implement Social Media OAuth**
   - Register apps with YouTube, TikTok, Instagram
   - Implement OAuth flows in `backend/routes/social.js`
   - Store tokens securely (use a database)

3. **Add Database**
   - Store video metadata
   - Track processing jobs
   - Manage user accounts

4. **Enable HTTPS**
   - Required for OAuth callbacks
   - Use Let's Encrypt or similar

5. **Configure CORS**
   - Update `FRONTEND_URL` to your domain
   - Whitelist specific origins only

6. **Set Up File Storage**
   - Use cloud storage (AWS S3, Google Cloud Storage)
   - Don't store videos on server long-term

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using React, Node.js, and Gemini AI**
#   A i c l i p p e r  
 