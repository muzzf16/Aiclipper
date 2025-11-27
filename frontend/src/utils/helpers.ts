/**
 * Convert seconds to MM:SS format
 */
export function secondsToMMSS(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert MM:SS format to seconds
 */
export function mmssToSeconds(mmss: string): number {
    const [mins, secs] = mmss.split(':').map(Number);
    return (mins * 60) + secs;
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate video file type
 */
export function isValidVideoFile(file: File): boolean {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    return validTypes.includes(file.type);
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    return extractYouTubeId(url) !== null;
}

/**
 * Get virality score color based on value
 */
export function getViralityColor(score: number): string {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
}

/**
 * Get virality score background color
 */
export function getViralityBgColor(score: number): string {
    if (score >= 8) return 'bg-green-500/20';
    if (score >= 6) return 'bg-yellow-500/20';
    if (score >= 4) return 'bg-orange-500/20';
    return 'bg-red-500/20';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number | null = null;

    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait) as unknown as number;
    };
}
