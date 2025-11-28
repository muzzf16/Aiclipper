import React, { useState } from 'react';
import { Youtube, Music2, Instagram, Share2, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import type { Clip, SocialPlatform } from '../types/types';
import apiService from '../services/apiService';

interface SocialUploadProps {
    selectedClip: Clip | null;
    fileId: string | null;
    disabled?: boolean;
}

const platformConfig: Record<SocialPlatform, {
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}> = {
    youtube: {
        name: 'YouTube Shorts',
        icon: <Youtube className="w-5 h-5" />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
    },
    tiktok: {
        name: 'TikTok',
        icon: <Music2 className="w-5 h-5" />,
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/20',
    },
    instagram: {
        name: 'Instagram Reels',
        icon: <Instagram className="w-5 h-5" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
    },
};

export const SocialUpload: React.FC<SocialUploadProps> = ({
    selectedClip,
    fileId,
    disabled = false,
}) => {
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [tags, setTags] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        platform: string;
        postUrl?: string;
        error?: string;
    } | null>(null);

    // Pre-fill form when clip is selected
    React.useEffect(() => {
        if (selectedClip) {
            setTitle(selectedClip.title);
            setCaption(selectedClip.summary);
            setTags('viral,shorts,ai');
        }
    }, [selectedClip]);

    const handlePlatformSelect = async (platform: SocialPlatform) => {
        if (disabled || !selectedClip) return;

        // Open OAuth flow
        try {
            const { authUrl } = await apiService.getOAuthUrl(platform);

            // Check for simulation/placeholder URL
            if (authUrl.startsWith('#')) {
                setSelectedPlatform(platform);
                return;
            }

            // Open OAuth in new window
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const authWindow = window.open(
                authUrl,
                `${platform}_auth`,
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Wait for OAuth callback
            window.addEventListener('message', (event) => {
                if (event.data.type === 'oauth_success') {
                    setSelectedPlatform(platform);
                    authWindow?.close();
                }
            });
        } catch (error: any) {
            console.error('OAuth error:', error);
            // For MVP, allow manual connection
            setSelectedPlatform(platform);
        }
    };

    const handleUpload = async () => {
        if (!selectedPlatform || !selectedClip || !fileId || !title.trim()) {
            return;
        }

        setIsUploading(true);
        setUploadResult(null);

        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

            const result = await apiService.uploadToSocial({
                filePath: fileId,
                clipId: selectedClip.id,
                platform: selectedPlatform,
                title: title.trim(),
                caption: caption.trim(),
                tags: tagArray,
            });

            setUploadResult(result);

            if (result.success) {
                // Reset form after successful upload
                setTimeout(() => {
                    setSelectedPlatform(null);
                    setUploadResult(null);
                }, 5000);
            }
        } catch (error: any) {
            setUploadResult({
                success: false,
                platform: selectedPlatform,
                error: error.message || 'Upload failed',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const isDisabled = disabled || !selectedClip || !fileId;

    return (
        <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gradient">
                        Social Media Upload
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Share your clip to YouTube Shorts, TikTok, or Instagram Reels
                    </p>
                </div>
                <Share2 className="w-8 h-8 text-gray-700" />
            </div>

            {/* Platform Selection */}
            {!selectedPlatform && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-400">
                        Select Platform
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(Object.keys(platformConfig) as SocialPlatform[]).map((platform) => {
                            const config = platformConfig[platform];
                            return (
                                <button
                                    key={platform}
                                    onClick={() => handlePlatformSelect(platform)}
                                    disabled={isDisabled}
                                    className={`
                    card-hover p-4 text-left space-y-3
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                                >
                                    <div className={`flex items-center gap-3`}>
                                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                            <div className={config.color}>
                                                {config.icon}
                                            </div>
                                        </div>
                                        <span className="font-semibold text-white">
                                            {config.name}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {isDisabled && (
                        <p className="text-sm text-yellow-400 flex items-center gap-2 mt-2">
                            <span>⚠️</span>
                            <span>Please select a clip first to enable social media upload</span>
                        </p>
                    )}
                </div>
            )}

            {/* Upload Form */}
            {selectedPlatform && !uploadResult && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 glass rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${platformConfig[selectedPlatform].bgColor}`}>
                                <div className={platformConfig[selectedPlatform].color}>
                                    {platformConfig[selectedPlatform].icon}
                                </div>
                            </div>
                            <span className="font-semibold text-white">
                                {platformConfig[selectedPlatform].name}
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedPlatform(null)}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Change
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter video title"
                            className="input"
                            maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {title.length}/100 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Caption
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add a caption..."
                            className="input min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {caption.length}/500 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="viral, shorts, trending (comma-separated)"
                            className="input"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate tags with commas
                        </p>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !title.trim()}
                        className="btn-primary w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Share2 className="w-5 h-5 inline mr-2" />
                                Upload to {platformConfig[selectedPlatform].name}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
                <div className={`
          p-4 rounded-lg border
          ${uploadResult.success
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }
        `}>
                    <div className="flex items-start gap-3">
                        {uploadResult.success ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <ExternalLink className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <h4 className={`font-semibold mb-2 ${uploadResult.success ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                            </h4>
                            {uploadResult.success && uploadResult.postUrl && (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">
                                        Your clip has been uploaded to {uploadResult.platform}
                                    </p>
                                    <a
                                        href={uploadResult.postUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary text-sm inline-flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Post
                                    </a>
                                </div>
                            )}
                            {!uploadResult.success && uploadResult.error && (
                                <p className="text-sm text-red-300">
                                    {uploadResult.error}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
