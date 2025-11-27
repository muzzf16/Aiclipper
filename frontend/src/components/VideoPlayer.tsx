import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, SkipBack, SkipForward } from 'lucide-react';
import type { Clip, TranscriptSegment } from '../types/types';
import { mmssToSeconds, secondsToMMSS } from '../utils/helpers';

interface VideoPlayerProps {
    videoUrl: string | null;
    selectedClip: Clip | null;
    isVerticalMode?: boolean;
    onToggleVerticalMode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    selectedClip,
    isVerticalMode = false,
    onToggleVerticalMode,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState<string>('');

    // Reset player when video changes
    useEffect(() => {
        if (videoRef.current && videoUrl) {
            videoRef.current.load();
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [videoUrl]);

    // Handle clip selection - jump to clip start
    useEffect(() => {
        if (selectedClip && videoRef.current) {
            const startSeconds = mmssToSeconds(selectedClip.start);
            videoRef.current.currentTime = startSeconds;
            setCurrentTime(startSeconds);
        }
    }, [selectedClip]);

    // Update current time and enforce clip boundaries
    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        const handleTimeUpdate = () => {
            const current = video.currentTime;
            setCurrentTime(current);

            // Enforce clip boundaries
            if (selectedClip) {
                const startSeconds = mmssToSeconds(selectedClip.start);
                const endSeconds = mmssToSeconds(selectedClip.end);

                if (current < startSeconds) {
                    video.currentTime = startSeconds;
                } else if (current >= endSeconds) {
                    // Loop back to clip start
                    video.currentTime = startSeconds;
                }

                // Update subtitle
                updateSubtitle(current, selectedClip.transcript);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (selectedClip) {
                // Loop back to clip start
                video.currentTime = mmssToSeconds(selectedClip.start);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, [selectedClip]);

    // Update subtitle based on current time
    const updateSubtitle = (currentSeconds: number, transcript: TranscriptSegment[]) => {
        if (!transcript || transcript.length === 0) {
            setCurrentSubtitle('');
            return;
        }

        const currentSegment = transcript.find((segment) => {
            const segmentStart = mmssToSeconds(segment.start);
            const segmentEnd = mmssToSeconds(segment.end);
            return currentSeconds >= segmentStart && currentSeconds < segmentEnd;
        });

        setCurrentSubtitle(currentSegment?.text || '');
    };

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    const skipBackward = () => {
        if (videoRef.current) {
            const newTime = Math.max(
                selectedClip ? mmssToSeconds(selectedClip.start) : 0,
                currentTime - 5
            );
            videoRef.current.currentTime = newTime;
        }
    };

    const skipForward = () => {
        if (videoRef.current) {
            const maxTime = selectedClip
                ? mmssToSeconds(selectedClip.end)
                : duration;
            const newTime = Math.min(maxTime, currentTime + 5);
            videoRef.current.currentTime = newTime;
        }
    };

    const getSeekRange = () => {
        if (selectedClip) {
            return {
                min: mmssToSeconds(selectedClip.start),
                max: mmssToSeconds(selectedClip.end),
            };
        }
        return { min: 0, max: duration };
    };

    const seekRange = getSeekRange();

    if (!videoUrl) {
        return (
            <div className="card p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Video Loaded
                </h3>
                <p className="text-gray-500">
                    Upload a video or paste a YouTube URL to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Player Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient">
                    {selectedClip ? selectedClip.title : 'Video Preview'}
                </h2>
                {onToggleVerticalMode && (
                    <button
                        onClick={onToggleVerticalMode}
                        className="btn-secondary text-sm"
                        title={isVerticalMode ? 'Standard View' : 'Vertical View (9:16)'}
                    >
                        {isVerticalMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span className="ml-2">{isVerticalMode ? 'Standard' : 'Vertical'}</span>
                    </button>
                )}
            </div>

            {/* Video Container */}
            <div
                className={`
          ${isVerticalMode ? 'video-container-vertical' : 'video-container aspect-video'}
          relative
        `}
            >
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={videoUrl}
                    playsInline
                >
                    Your browser does not support the video tag.
                </video>

                {/* Subtitle Overlay */}
                {currentSubtitle && (
                    <div className="subtitle-overlay">
                        <div className="subtitle-text">
                            {currentSubtitle}
                        </div>
                    </div>
                )}

                {/* Play/Pause Overlay (when not playing) */}
                {!isPlaying && (
                    <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/10 transition-colors"
                        onClick={togglePlay}
                    >
                        <div className="bg-primary-600/90 backdrop-blur-sm rounded-full p-6 hover:bg-primary-600 transition-colors">
                            <Play className="w-12 h-12 text-white fill-white" />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="card p-4 space-y-4">
                {/* Timeline */}
                <div className="space-y-2">
                    <input
                        type="range"
                        min={seekRange.min}
                        max={seekRange.max}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        style={{
                            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((currentTime - seekRange.min) / (seekRange.max - seekRange.min)) * 100
                                }%, #1f2937 ${((currentTime - seekRange.min) / (seekRange.max - seekRange.min)) * 100
                                }%, #1f2937 100%)`
                        }}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{secondsToMMSS(currentTime)}</span>
                        <span>{secondsToMMSS(seekRange.max)}</span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={skipBackward}
                            className="btn-secondary p-2"
                            title="Skip backward 5s"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="btn-primary p-3"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6" />
                            )}
                        </button>
                        <button
                            onClick={skipForward}
                            className="btn-secondary p-2"
                            title="Skip forward 5s"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleMute}
                            className="btn-secondary p-2"
                        >
                            {isMuted ? (
                                <VolumeX className="w-5 h-5" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                    </div>
                </div>
            </div>

            {/* Clip Info */}
            {selectedClip && (
                <div className="card p-4">
                    <div className="text-sm text-gray-400 mb-2">
                        <span className="font-semibold text-white">Current Clip:</span> {selectedClip.title}
                    </div>
                    <p className="text-sm text-gray-500">{selectedClip.summary}</p>
                </div>
            )}
        </div>
    );
};
