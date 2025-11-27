# 📌 Dokumen Pengembangan Aplikasi Smart Video Clipper for YouTube Shorts

Versi: 1.0
Tanggal: 27 November 2025
Status: Active Development

---
## 🎯 Tujuan Utama
Membangun aplikasi **Smart AI-based Video Clipper** untuk membuat YouTube Shorts/TikTok/Instagram Reels menggunakan **React + TypeScript + TailwindCSS** (frontend) dan **Node.js + Express** (backend), dengan kemampuan:
- Upload video lokal / download dari YouTube
- Analisis video otomatis menggunakan Gemini (AI)
- Transkripsi otomatis menggunakan Whisper (opsional)
- Penentuan highlight clip otomatis
- Pemutaran dan preview clip dengan HTML overlay subtitles tanpa rendering ulang
- Export metadata dan upload file hasil ke Google Drive

---
## 🏗️ Arsitektur Sistem
```
Client (React SPA)
⤷ Video upload & UI Editor
⤷ Gemini result viewer & highlight selector
      │
      ▼
Backend (Node/Express)
⤷ File handling (upload/download)
⤷ FFmpeg audio extraction
⤷ Whisper local transcription
⤷ Gemini AI video analysis (clip metadata)
⤷ Google Drive uploader
      │
      ▼
Storage
⤷ Local uploads
⤷ Google Drive
```

---
## 🎨 Frontend Development
### Teknologi & Tools
| Komponen | Teknologi |
|----------|-----------|
| Framework | React + Vite + TypeScript |
| Styling | TailwindCSS + Shadcn/UI |
| Video Player | Native `<video>` + React Ref control |
| State management | Hooks / Context API |
| API handler | Axios |
| Subtitle | HTML overlay layer |

### Struktur Folder
```
frontend/
│ src/
│   ├── components/
│   │   ├── VideoUploader.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── ClipSelector.tsx
│   │   └── AnalysisStatus.tsx
│   ├── services/
│   │   └── geminiService.ts
│   ├── types/
│   │   └── types.ts
│   └── App.tsx
└── public/
```

### ### Flow Frontend (Revisi dengan YouTube URL → Download)
```
User paste YouTube URL
↓
Backend /api/youtube/download: fetch video → return downloadable video file
↓
Automatically display file in Video Player
↓
Send video to /api/process for audio extraction + STT + Gemini
↓
Get AI Result Clips
↓
User Select Clip → Player jumps to start-end timestamps
↓
Export Metadata & Upload ke Drive
```

### System Prompt Gemini (Final Version)
```
You are an expert video editor specializing in detecting high–impact moments for short–form content such as YouTube Shorts or TikTok. Analyze the video transcript and identify the most engaging, viral–potential highlight segments. Return results strictly in valid JSON format.

GOAL:
Extract the best short–form content moments based on engagement, emotional intensity, important statements, jokes, reactions, or key learning points.

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
```
 & Upload ke Drive
```

### Data Type Clip (Schema JSON)
```ts
export interface Clip {
  id: string;
  title: string;
  summary: string;
  start: string; // MM:SS
  end: string;   // MM:SS
  viralityScore: number;
  transcript: TranscriptSegment[];
}
```

---
## ⚙ Backend Development
### Teknologi
| Bagian | Teknologi |
|--------|-----------|
| Server | Node.js + Express |
| Upload file | Multer |
| Processing audio | FFmpeg CLI |
| Speech-to-text | Whisper.cpp (opsional) |
| AI model | Gemini 2.5 Flash |
| Cloud Storage | Google Drive API |
| Format | JSON structured response |

### Struktur Folder Backend
```
backend/
│ uploads/
│ services/
│   ├── driveService.js
│   ├── whisperService.js
│   └── geminiService.js
│ routes/
│   ├── index.js
│   ├── process.js
│ server.js
```

### Endpoint API
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/upload` | Upload video lokal |
| POST | `/api/youtube/download` | Download video dari YouTube |
| POST | `/api/process` | Extract audio → STT → Gemini → Upload Drive |
| GET | `/api/files` | List hasil chache uploads |

### Flow Backend
```
Receive file
↓
Extract audio (ffmpeg)
↓
Call whisper.cpp → transcript.txt
↓
Call Gemini (analysis)
↓
Save structured clip metadata
↓
Upload to Google Drive
↓
Send response JSON
```

### Format Response API
```json
{
  "status": "ok",
  "transcript": "string",
  "clips": [
    {
      "id": 1,
      "title": "Best moment",
      "start": "00:18",
      "end": "01:02",
      "summary": "Important highlight discussion point",
      "viralityScore": 9.1
    }
  ],
  "drive": {
    "fileId": "xxxx",
    "url": "https://drive.google.com/..."
  }
}
```

---
## 📅 Rencana Pengembangan (Milestone)
| Tahap | Fitur | Status |
|--------|--------|--------|
| M1 | File Upload, Video Player, Gemini Endpoint | ✔ selesai |
| M2 | Whisper STT + AI Clip Analysis | 🔄 in progress |
| M3 | Fully clip selector & subtitles overlay | ⏳ next |
| M4 | Dashboard History + Authentication | ⏳ next |
| M5 | Export template video + presets | ⏳ later |

---
## ⚠ Risiko & Catatan Teknis
- Video besar > 50MB tidak disarankan untuk synchronous processing
- Gemini parsing perlu schema ketat agar JSON tidak corrupt
- Whisper inference membutuhkan CPU yang cukup

---
## 📍 Kesimpulan
Aplikasi Smart Video Clipper akan menjadi editor AI-first berbasis browser dengan kemampuan AI untuk menentukan bagian terbaik video dan menghasilkan highlight preview secara real-time tanpa re-render video.

Backend mendukung semua pemrosesan berat, sedangkan frontend fokus pada UX editing.

---
## 🚀 Next Steps (Updated)
- Tambah tombol **Analyze with AI** setelah video berhasil didownload (pilihan user: B)
- Integrasi upload ke platform sosial: **YouTube Shorts, TikTok, Instagram Reels**
- Preview subtitle styling
- Export SHORT style 9:16 mock rendering

---
## 📤 Fitur Upload ke Social Media (Baru)
### Target Platform
| Platform | Metode Upload | Status |
|-----------|----------------|---------|
| YouTube Shorts | YouTube Data API v3 | Planned |
| TikTok | TikTok Upload API | Planned |
| Instagram Reels | Instagram Graph API | Planned |

### Alur Upload Sosial
```
User Select Final Clip
↓
Generate Render Metadata + Title
↓
User Login OAuth per Platform
↓
Upload via API
↓
Return Publishing Link & Status
```

### Endpoint API Baru
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | /api/social/upload/youtube | Upload clip ke YouTube Shorts |
| POST | /api/social/upload/tiktok | Upload clip ke TikTok |
| POST | /api/social/upload/instagram | Upload clip ke Instagram Reels |

### Struktur Request Upload
```json
{
  "filePath": "string",
  "title": "string",
  "caption": "string",
  "tags": ["string"],
  "accessToken": "string"
}
```

### UI/UX Upload
```
[Analyze with AI]
↓
[Select Clip]
↓
[Upload Options]
  ├── YouTube Shorts
  ├── TikTok
  └── Instagram Reels
```

---
## 🎬 Catatan UI Baru
- Tombol "Analyze with AI" hanya muncul setelah video siap diputar
- Setelah AI selesai → panel upload sosial aktif
- OAuth pop-up per platform

---
## 📦 Integrasi Teknis API Sosial
### YouTube Shorts (Contoh Penggunaan API)
```bash
POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable
Authorization: Bearer <token>
Content-Type: application/json
```

### Metadata Upload
```json
{
  "snippet": {
    "title": "Clip Highlight",
    "description": "Generated by AI Video Clipper",
    "tags": ["shorts", "viral", "ai"]
  },
  "status": {
    "privacyStatus": "private"
  }
}
```

---
## 📍 Status Pengembangan
- AI Workflow: 80%
- Social Upload Integration: in queue for development
- OAuth Authentication flow: pending

---
**Dokumen akan diperbarui setelah integrasi upload pertama berjalan.**

