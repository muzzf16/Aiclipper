import { useState } from 'react';
import { Sparkles, Settings } from 'lucide-react';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayer } from './components/VideoPlayer';
import { ClipSelector } from './components/ClipSelector';
import { AnalysisStatus } from './components/AnalysisStatus';
import { SocialUpload } from './components/SocialUpload';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import apiService from './services/apiService';
import type { Clip, AnalysisStatusType, AnalysisResult } from './types/types';
import './index.css';

function App() {
  // Video state
  const [fileId, setFileId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Analysis state
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatusType>('idle');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isVerticalMode, setIsVerticalMode] = useState(false);
  const [showSocialUpload, setShowSocialUpload] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  // Handle video upload/download completion
  const handleVideoUploaded = (newFileId: string, newVideoUrl: string, _newFilename: string) => {
    setFileId(newFileId);

    // Construct full URL if it's a relative path
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const BACKEND_URL = API_URL.replace('/api', '');
    const fullVideoUrl = newVideoUrl.startsWith('http') ? newVideoUrl : `${BACKEND_URL}${newVideoUrl}`;

    setVideoUrl(fullVideoUrl);
    // filename parameter kept for API compatibility but not stored
    setError(null);
    setAnalysisStatus('idle');
    setClips([]);
    setSelectedClip(null);
    setShowSocialUpload(false);
  };

  // Handle video upload/download error
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  // Start AI analysis
  const handleAnalyzeVideo = async () => {
    if (!fileId) return;

    setError(null);
    setAnalysisStatus('analyzing');
    setAnalysisMessage('Starting AI analysis...');
    setAnalysisProgress(10);
    setClips([]);
    setSelectedClip(null);

    try {
      // Check if we should use async processing
      // For simplicity, we'll use sync for files < 50MB, async for larger
      const useAsync = false; // We can add file size check here later

      if (useAsync) {
        // Async processing with polling
        const response = await apiService.processVideo(fileId, true) as { processId: string };

        setAnalysisMessage('Processing asynchronously. This may take a few minutes...');
        setAnalysisProgress(30);

        const result = await apiService.pollProcessingStatus(
          response.processId,
          (status) => {
            setAnalysisStatus(status.status);
            setAnalysisMessage(status.message);
            setAnalysisProgress(status.progress);
          }
        );

        handleAnalysisComplete(result);
      } else {
        // Synchronous processing
        setAnalysisMessage('Analyzing video with Gemini AI...');
        setAnalysisProgress(50);

        const result = await apiService.processVideo(fileId, false, systemPrompt || undefined) as AnalysisResult;

        setAnalysisProgress(100);
        handleAnalysisComplete(result);
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisStatus('error');
      setAnalysisMessage(error.message || 'Analysis failed. Please try again.');
      setError(error.message || 'Analysis failed');
    }
  };

  // Handle analysis completion
  const handleAnalysisComplete = (result: AnalysisResult) => {
    if (result.status === 'ok' && result.clips && result.clips.length > 0) {
      setClips(result.clips);
      setSelectedClip(result.clips[0]); // Auto-select first clip
      setAnalysisStatus('complete');
      setAnalysisMessage(`Found ${result.clips.length} highlight clips!`);
      setShowSocialUpload(true);
    } else {
      setAnalysisStatus('error');
      setAnalysisMessage('No clips found. Try a different video.');
      setError('No highlight clips were detected in this video.');
    }
  };

  // Handle clip selection
  const handleSelectClip = (clip: Clip) => {
    setSelectedClip(clip);
  };

  const hasVideo = videoUrl !== null;
  const hasClips = clips.length > 0;
  const canAnalyze = hasVideo && analysisStatus !== 'analyzing' && !hasClips;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                AI Video Clipper
              </h1>
              <p className="text-sm text-gray-400">
                Transform videos into viral shorts with AI
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            {!hasVideo && (
              <VideoUploader
                onVideoUploaded={handleVideoUploaded}
                onError={handleError}
                disabled={analysisStatus === 'analyzing'}
              />
            )}

            {/* Video Player */}
            {hasVideo && (
              <VideoPlayer
                videoUrl={videoUrl}
                selectedClip={selectedClip}
                isVerticalMode={isVerticalMode}
                onToggleVerticalMode={() => setIsVerticalMode(!isVerticalMode)}
              />
            )}

            {/* Analyze Button */}
            {canAnalyze && (
              <div className="space-y-3">
                <button
                  onClick={handleAnalyzeVideo}
                  className="btn-accent w-full py-4 text-lg font-bold shadow-2xl shadow-accent-900/50"
                >
                  <Sparkles className="w-6 h-6 inline mr-2" />
                  Analyze with AI
                </button>
                <button
                  onClick={() => setShowPromptEditor(true)}
                  className="btn-secondary w-full text-sm"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  {systemPrompt ? 'Edit Custom Prompt' : 'Customize AI Prompt'}
                </button>
              </div>
            )}

            {/* Analysis Status */}
            {analysisStatus !== 'idle' && (
              <AnalysisStatus
                status={analysisStatus}
                message={analysisMessage}
                progress={analysisProgress}
              />
            )}

            {/* Social Media Upload */}
            {showSocialUpload && hasClips && (
              <SocialUpload
                selectedClip={selectedClip}
                fileId={fileId}
                disabled={!selectedClip}
              />
            )}

            {/* Reset Button */}
            {hasVideo && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setFileId(null);
                    setVideoUrl(null);
                    setClips([]);
                    setSelectedClip(null);
                    setAnalysisStatus('idle');
                    setShowSocialUpload(false);
                  }}
                  className="btn-secondary"
                >
                  Upload New Video
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Clip Selector */}
          <div className="lg:col-span-1">
            <ClipSelector
              clips={clips}
              selectedClip={selectedClip}
              onSelectClip={handleSelectClip}
            />
          </div>
        </div>

        {/* Info Section (when no video is loaded) */}
        {!hasVideo && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                <span className="text-3xl">🎬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Upload Video
              </h3>
              <p className="text-sm text-gray-400">
                Upload a local video or paste a YouTube URL to get started
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI Analysis
              </h3>
              <p className="text-sm text-gray-400">
                Our AI identifies the most engaging moments perfect for Shorts
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Share & Export
              </h3>
              <p className="text-sm text-gray-400">
                Upload directly to YouTube Shorts, TikTok, or Instagram Reels
              </p>
            </div>
          </div>
        )}
      </main>

      {/* System Prompt Editor Modal */}
      <SystemPromptEditor
        isOpen={showPromptEditor}
        onClose={() => setShowPromptEditor(false)}
        currentPrompt={systemPrompt}
        onSave={setSystemPrompt}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-sm bg-black/20 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Powered by Gemini AI • Built with React & TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
