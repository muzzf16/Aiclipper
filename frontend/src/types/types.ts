// ===== Video Analysis Types =====

export interface TranscriptSegment {
    start: string; // MM:SS format
    end: string;   // MM:SS format
    text: string;
}

export interface Clip {
    id: string;
    title: string;
    summary: string;
    start: string; // MM:SS format
    end: string;   // MM:SS format
    viralityScore: number; // 0-10
    transcript: TranscriptSegment[];
}

export interface AnalysisResult {
    status: 'ok' | 'error';
    transcript?: string;
    clips: Clip[];
    drive?: {
        fileId: string;
        url: string;
    };
}

// ===== Analysis Status Types =====

export type AnalysisStatusType = 'idle' | 'uploading' | 'downloading' | 'extracting' | 'transcribing' | 'analyzing' | 'complete' | 'error';

export interface AnalysisStatus {
    status: AnalysisStatusType;
    message: string;
    progress?: number; // 0-100
}

// ===== Upload/Download Types =====

export interface UploadResponse {
    fileId: string;
    filename: string;
    size: number;
    videoUrl: string;
}

export interface YouTubeDownloadRequest {
    url: string;
}

export interface YouTubeDownloadResponse {
    fileId: string;
    videoUrl: string;
    title: string;
    duration: number;
}

// ===== Processing Types =====

export interface ProcessRequest {
    fileId: string;
    systemPrompt?: string;
}

export interface ProcessStatusResponse {
    status: AnalysisStatusType;
    message: string;
    progress: number;
    result?: AnalysisResult;
}

// ===== Social Media Upload Types =====

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram';

export interface SocialUploadRequest {
    filePath: string;
    clipId: string;
    platform: SocialPlatform;
    title: string;
    caption: string;
    tags: string[];
    accessToken?: string;
}

export interface SocialUploadResponse {
    success: boolean;
    platform: SocialPlatform;
    postUrl?: string;
    postId?: string;
    error?: string;
}

// ===== OAuth Types =====

export interface OAuthResponse {
    authUrl: string;
    state: string;
}

export interface OAuthCallbackData {
    platform: SocialPlatform;
    code: string;
    state: string;
}

export interface OAuthTokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

// ===== Video Player Types =====

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
}

// ===== UI Component Types =====

export interface FileUploadState {
    file: File | null;
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export interface VideoState {
    fileId: string | null;
    videoUrl: string | null;
    filename: string | null;
    isAnalyzing: boolean;
    analysisResult: AnalysisResult | null;
    selectedClip: Clip | null;
    error: string | null;
}
