import React from 'react';
import { Loader2, CheckCircle2, XCircle, Upload, Scissors, Mic, Sparkles } from 'lucide-react';
import type { AnalysisStatusType } from '../types/types';

interface AnalysisStatusProps {
    status: AnalysisStatusType;
    message: string;
    progress?: number;
}

const statusConfig: Record<AnalysisStatusType, {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
}> = {
    idle: {
        icon: <Upload className="w-6 h-6" />,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        label: 'Ready',
    },
    uploading: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        label: 'Uploading',
    },
    downloading: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        label: 'Downloading',
    },
    extracting: {
        icon: <Scissors className="w-6 h-6 animate-pulse" />,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        label: 'Extracting Audio',
    },
    transcribing: {
        icon: <Mic className="w-6 h-6 animate-pulse" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        label: 'Transcribing',
    },
    analyzing: {
        icon: <Sparkles className="w-6 h-6 animate-pulse" />,
        color: 'text-primary-400',
        bgColor: 'bg-primary-500/20',
        label: 'Analyzing with AI',
    },
    complete: {
        icon: <CheckCircle2 className="w-6 h-6" />,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        label: 'Complete',
    },
    error: {
        icon: <XCircle className="w-6 h-6" />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        label: 'Error',
    },
};

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
    status,
    message,
    progress,
}) => {
    const config = statusConfig[status];

    if (status === 'idle') {
        return null;
    }

    return (
        <div className="card p-6">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${config.bgColor}`}>
                    <div className={config.color}>
                        {config.icon}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${config.color}`}>
                            {config.label}
                        </h3>
                        {progress !== undefined && status !== 'complete' && status !== 'error' && (
                            <span className="text-sm font-semibold text-gray-400">
                                {progress}%
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">{message}</p>
                    {progress !== undefined && status !== 'complete' && status !== 'error' && (
                        <div className="progress-bar mt-3">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Processing Steps Indicator */}
            {status !== 'complete' && status !== 'error' && (
                <div className="mt-6 grid grid-cols-5 gap-2">
                    <div className={`h-1 rounded-full ${['uploading', 'downloading', 'extracting', 'transcribing', 'analyzing'].includes(status)
                        ? 'bg-primary-600'
                        : 'bg-gray-700'
                        }`} />
                    <div className={`h-1 rounded-full ${['downloading', 'extracting', 'transcribing', 'analyzing'].includes(status)
                        ? 'bg-primary-600'
                        : 'bg-gray-700'
                        }`} />
                    <div className={`h-1 rounded-full ${['extracting', 'transcribing', 'analyzing'].includes(status)
                        ? 'bg-primary-600'
                        : 'bg-gray-700'
                        }`} />
                    <div className={`h-1 rounded-full ${['transcribing', 'analyzing'].includes(status)
                        ? 'bg-primary-600'
                        : 'bg-gray-700'
                        }`} />
                    <div className={`h-1 rounded-full ${status === 'analyzing'
                        ? 'bg-primary-600'
                        : 'bg-gray-700'
                        }`} />
                </div>
            )}

            {/* Success or Error Details */}
            {status === 'complete' && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                        ✓ Analysis complete! Select a clip from the list to preview.
                    </p>
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 font-semibold mb-1">
                        Error Details:
                    </p>
                    <p className="text-sm text-red-300">
                        {message}
                    </p>
                </div>
            )}
        </div>
    );
};
