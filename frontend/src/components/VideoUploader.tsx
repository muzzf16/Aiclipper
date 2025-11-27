import React, { useState, useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Link, Loader2, AlertCircle, Check } from 'lucide-react';
import { isValidVideoFile, isValidYouTubeUrl, formatFileSize } from '../utils/helpers';

interface VideoUploaderProps {
    onVideoUploaded: (fileId: string, videoUrl: string, filename: string) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB for direct upload

export const VideoUploader: React.FC<VideoUploaderProps> = ({
    onVideoUploaded,
    onError,
    disabled = false,
}) => {
    const [uploadMode, setUploadMode] = useState<'file' | 'youtube'>('file');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        // Validate file type
        if (!isValidVideoFile(file)) {
            onError('Invalid file type. Please upload MP4, MOV, AVI, or WebM files.');
            return;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            onError(
                `File size (${formatFileSize(file.size)}) exceeds the 20MB limit for direct uploads. ` +
                'Please use a YouTube URL for larger videos, or the file will be processed asynchronously.'
            );

            // Allow upload but warn it will be async
            const shouldContinue = window.confirm(
                `This file (${formatFileSize(file.size)}) is large and will be processed asynchronously. ` +
                'You will be able to check the progress. Continue?'
            );

            if (!shouldContinue) return;
        }

        try {
            setIsUploading(true);
            setUploadStatus('Uploading video...');
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('video', file);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    setUploadStatus('Upload complete!');
                    setTimeout(() => {
                        onVideoUploaded(response.fileId, response.videoUrl, response.filename);
                        setIsUploading(false);
                        setUploadProgress(0);
                        setUploadStatus('');
                    }, 500);
                } else {
                    const error = JSON.parse(xhr.responseText);
                    onError(error.message || 'Upload failed');
                    setIsUploading(false);
                    setUploadProgress(0);
                    setUploadStatus('');
                }
            });

            xhr.addEventListener('error', () => {
                onError('Network error during upload');
                setIsUploading(false);
                setUploadProgress(0);
                setUploadStatus('');
            });

            xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`);
            xhr.send(formData);
        } catch (error: any) {
            onError(error.message || 'Upload failed');
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus('');
        }
    };

    const handleYouTubeDownload = async () => {
        if (!youtubeUrl.trim()) {
            onError('Please enter a YouTube URL');
            return;
        }

        if (!isValidYouTubeUrl(youtubeUrl)) {
            onError('Invalid YouTube URL. Please enter a valid YouTube video link.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadStatus('Downloading from YouTube...');
            setUploadProgress(50);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/youtube/download`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: youtubeUrl }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Download failed');
            }

            const data = await response.json();
            setUploadProgress(100);
            setUploadStatus('Download complete!');

            setTimeout(() => {
                onVideoUploaded(data.fileId, data.videoUrl, data.title || 'YouTube Video');
                setIsUploading(false);
                setUploadProgress(0);
                setUploadStatus('');
                setYoutubeUrl('');
            }, 500);
        } catch (error: any) {
            onError(error.message || 'YouTube download failed');
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus('');
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled || isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled && !isUploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient">Upload Video</h2>
                {!isUploading && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setUploadMode('file')}
                            className={`btn text-sm ${uploadMode === 'file'
                                ? 'btn-primary'
                                : 'btn-secondary'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline mr-1" />
                            File
                        </button>
                        <button
                            onClick={() => setUploadMode('youtube')}
                            className={`btn text-sm ${uploadMode === 'youtube'
                                ? 'btn-primary'
                                : 'btn-secondary'
                                }`}
                        >
                            <Link className="w-4 h-4 inline mr-1" />
                            YouTube
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{uploadStatus}</span>
                        <span className="text-sm font-semibold text-primary-400">{uploadProgress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </div>
                </div>
            )}

            {/* File Upload Mode */}
            {!isUploading && uploadMode === 'file' && (
                <div>
                    <div
                        className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={handleBrowseClick}
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-lg font-semibold text-gray-300 mb-2">
                            Drop your video here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                            Supports MP4, MOV, AVI, WebM (Max 20MB for instant processing)
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={disabled || isUploading}
                    />
                    <div className="mt-4 p-3 glass rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-400">
                                <p className="font-semibold text-yellow-400 mb-1">File Size Limits:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Files up to 20MB: Instant processing</li>
                                    <li>Files 20MB-50MB: Async processing with progress updates</li>
                                    <li>Files over 50MB: Use YouTube upload for best experience</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Upload Mode */}
            {!isUploading && uploadMode === 'youtube' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            YouTube Video URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="input flex-1"
                                disabled={disabled}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleYouTubeDownload();
                                    }
                                }}
                            />
                            <button
                                onClick={handleYouTubeDownload}
                                disabled={disabled || !youtubeUrl.trim()}
                                className="btn-primary"
                            >
                                <Link className="w-5 h-5 inline mr-2" />
                                Download
                            </button>
                        </div>
                    </div>
                    <div className="p-3 glass rounded-lg">
                        <div className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-400">
                                <p className="font-semibold text-green-400 mb-1">Why use YouTube?</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>No file size limits</li>
                                    <li>Faster than large file uploads</li>
                                    <li>Perfect for long-form content</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
