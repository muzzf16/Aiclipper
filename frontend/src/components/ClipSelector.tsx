import React from 'react';
import { Play, Clock, TrendingUp, FileText } from 'lucide-react';
import type { Clip } from '../types/types';
import { getViralityColor, getViralityBgColor } from '../utils/helpers';

interface ClipSelectorProps {
    clips: Clip[];
    selectedClip: Clip | null;
    onSelectClip: (clip: Clip) => void;
}

export const ClipSelector: React.FC<ClipSelectorProps> = ({
    clips,
    selectedClip,
    onSelectClip,
}) => {
    if (clips.length === 0) {
        return (
            <div className="card p-8 text-center">
                < FileText className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Clips Yet
                </h3>
                <p className="text-gray-500">
                    Upload a video and analyze it to see AI-generated highlight clips here
                </p>
            </div >
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gradient">
                    Highlight Clips
                </h2>
                <span className="badge badge-info">
                    {clips.length} {clips.length === 1 ? 'Clip' : 'Clips'}
                </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {clips.map((clip, index) => {
                    const isSelected = selectedClip?.id === clip.id;

                    return (
                        <div
                            key={clip.id}
                            onClick={() => onSelectClip(clip)}
                            className={`
                ${isSelected ? 'clip-card-selected' : 'clip-card'}
                group relative
              `}
                        >
                            {/* Clip Number Badge */}
                            <div className="absolute top-4 right-4">
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400'}
                `}>
                                    {index + 1}
                                </div>
                            </div>

                            {/* Clip Title */}
                            <h3 className={`
                text-lg font-bold mb-2 pr-12
                ${isSelected ? 'text-primary-300' : 'text-white group-hover:text-primary-400'}
                transition-colors
              `}>
                                {clip.title}
                            </h3>

                            {/* Clip Summary */}
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                {clip.summary}
                            </p>

                            {/* Clip Metadata */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                {/* Duration */}
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">
                                        {clip.start} - {clip.end}
                                    </span>
                                </div>

                                {/* Virality Score */}
                                <div className="flex items-center gap-2">
                                    <TrendingUp className={`w-4 h-4 ${getViralityColor(clip.viralityScore)}`} />
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${getViralityColor(clip.viralityScore)}`}>
                                            {clip.viralityScore.toFixed(1)}
                                        </span>
                                        <div className="virality-bar w-20">
                                            <div
                                                className={`virality-bar-fill ${getViralityBgColor(clip.viralityScore)}`}
                                                style={{
                                                    width: `${(clip.viralityScore / 10) * 100}%`,
                                                    backgroundColor: clip.viralityScore >= 8 ? '#22c55e' :
                                                        clip.viralityScore >= 6 ? '#eab308' :
                                                            clip.viralityScore >= 4 ? '#f97316' : '#ef4444'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transcript Count */}
                            {clip.transcript && clip.transcript.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-800">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FileText className="w-3 h-3" />
                                        <span>{clip.transcript.length} transcript segments</span>
                                    </div>
                                </div>
                            )}

                            {/* Play Indicator */}
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-primary-600/20 backdrop-blur-sm rounded-full p-4">
                                        <Play className="w-8 h-8 text-primary-400 fill-primary-400" />
                                    </div>
                                </div>
                            )}

                            {/* Hover Effect */}
                            <div className={`
                absolute inset-0 rounded-lg pointer-events-none transition-all duration-300
                ${!isSelected && 'group-hover:shadow-xl group-hover:shadow-primary-900/20'}
              `} />
                        </div>
                    );
                })}
            </div>

            {/* Summary Statistics */}
            <div className="card p-4 mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-alt">
                        {((clips.reduce((sum, clip) => sum + (clip.viralityScore || 0), 0) / clips.length) || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Average Virality
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-accent-400">
                        {clips.filter(c => c.viralityScore >= 7).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        High-Value Clips
                    </div>
                </div>
            </div>
        </div>
    );
};
