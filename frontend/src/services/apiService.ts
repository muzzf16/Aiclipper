import axios from 'axios';
import type { AxiosInstance, AxiosProgressEvent } from 'axios';
import type {
    UploadResponse,
    YouTubeDownloadRequest,
    YouTubeDownloadResponse,
    ProcessRequest,
    AnalysisResult,
    ProcessStatusResponse,
    SocialUploadRequest,
    SocialUploadResponse,
    OAuthResponse,
    SocialPlatform,
} from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 300000, // 5 minutes for large file uploads
        });
    }

    /**
     * Upload a local video file
     */
    async uploadVideo(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('video', file);

        const response = await this.client.post<UploadResponse>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress?.(percentCompleted);
                }
            },
        });

        return response.data;
    }

    /**
     * Download video from YouTube
     */
    async downloadYouTube(
        url: string,
        onProgress?: (message: string) => void
    ): Promise<YouTubeDownloadResponse> {
        const response = await this.client.post<YouTubeDownloadResponse>(
            '/youtube/download',
            { url } as YouTubeDownloadRequest
        );

        onProgress?.('Download complete');
        return response.data;
    }

    /**
     * Process video with AI analysis (async mode for large files)
     */
    async processVideo(
        fileId: string,
        async: boolean = false,
        systemPrompt?: string
    ): Promise<AnalysisResult | { processId: string }> {
        const response = await this.client.post<AnalysisResult | { processId: string }>(
            '/process',
            { fileId, async, systemPrompt } as ProcessRequest & { async: boolean }
        );

        return response.data;
    }

    /**
     * Get processing status (for async processing)
     */
    async getProcessingStatus(processId: string): Promise<ProcessStatusResponse> {
        const response = await this.client.get<ProcessStatusResponse>(
            `/process/status/${processId}`
        );

        return response.data;
    }

    /**
     * Poll processing status until complete
     */
    async pollProcessingStatus(
        processId: string,
        onProgress?: (status: ProcessStatusResponse) => void,
        interval: number = 2000
    ): Promise<AnalysisResult> {
        return new Promise((resolve, reject) => {
            const poll = setInterval(async () => {
                try {
                    const status = await this.getProcessingStatus(processId);
                    onProgress?.(status);

                    if (status.status === 'complete' && status.result) {
                        clearInterval(poll);
                        resolve(status.result);
                    } else if (status.status === 'error') {
                        clearInterval(poll);
                        reject(new Error(status.message));
                    }
                } catch (error) {
                    clearInterval(poll);
                    reject(error);
                }
            }, interval);

            // Timeout after 10 minutes
            setTimeout(() => {
                clearInterval(poll);
                reject(new Error('Processing timeout - operation took too long'));
            }, 600000);
        });
    }

    /**
     * Get OAuth authorization URL for social media platform
     */
    async getOAuthUrl(platform: SocialPlatform): Promise<OAuthResponse> {
        const response = await this.client.get<OAuthResponse>(
            `/social/oauth/${platform}`
        );

        return response.data;
    }

    /**
     * Upload clip to social media platform
     */
    async uploadToSocial(
        request: SocialUploadRequest
    ): Promise<SocialUploadResponse> {
        const response = await this.client.post<SocialUploadResponse>(
            `/social/upload/${request.platform}`,
            request
        );

        return response.data;
    }

    /**
     * Get list of uploaded files
     */
    async getFiles(): Promise<{ files: Array<{ fileId: string; filename: string }> }> {
        const response = await this.client.get('/files');
        return response.data;
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
