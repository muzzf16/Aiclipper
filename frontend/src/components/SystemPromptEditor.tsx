import { useState, useEffect } from 'react';
import { X, Sparkles, FileText, BookOpen, GraduationCap } from 'lucide-react';

interface SystemPromptEditorProps {
    isOpen: boolean;
    onClose: () => void;
    currentPrompt: string;
    onSave: (prompt: string) => void;
}

const DEFAULT_PROMPT = `You are an expert video editor specializing in detecting high-impact moments for short-form content such as YouTube Shorts or TikTok. Analyze the video transcript and identify the most engaging, viral-potential highlight segments. Return results strictly in valid JSON format.

GOAL:
Extract the best short-form content moments based on engagement, emotional intensity, important statements, jokes, reactions, or key learning points.

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
- Generate 3-7 clips per video
- Each clip should be 15-60 seconds long
- viralityScore should be realistic (most clips 4-8, exceptional ones 9-10)`;

const PRESETS = {
    default: {
        name: 'Default',
        icon: Sparkles,
        prompt: DEFAULT_PROMPT,
    },
    creative: {
        name: 'Creative Focus',
        icon: FileText,
        prompt: `You are a creative video curator focused on finding unique, artistic, and emotionally powerful moments. Analyze the video and identify segments with strong visual storytelling, creative techniques, or emotional depth. Return results in valid JSON format.

GOAL:
Find the most creative and emotionally resonant moments that showcase artistry, unique perspectives, or powerful storytelling.

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
- Prioritize artistic and emotional moments
- Focus on visual storytelling and creative techniques
- Return only valid JSON without additional text
- Generate 3-7 clips per video
- Each clip should be 20-60 seconds long`,
    },
    educational: {
        name: 'Educational',
        icon: GraduationCap,
        prompt: `You are an educational content specialist. Analyze the video and identify key learning moments, important concepts, and valuable insights that would make great educational shorts. Return results in valid JSON format.

GOAL:
Extract the most valuable educational moments that teach concepts, share insights, or provide actionable knowledge.

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
- Focus on educational value and clarity
- Prioritize complete explanations and key concepts
- Return only valid JSON without additional text
- Generate 3-7 clips per video
- Each clip should be 30-90 seconds long for completeness`,
    },
    technical: {
        name: 'Technical Deep Dive',
        icon: BookOpen,
        prompt: `You are a technical content analyzer focused on detailed explanations, demonstrations, and technical insights. Identify segments with valuable technical content, step-by-step processes, or in-depth explanations. Return results in valid JSON format.

GOAL:
Extract technical moments that showcase expertise, detailed processes, or valuable technical insights.

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
- Prioritize technical depth and accuracy
- Focus on complete demonstrations and explanations
- Return only valid JSON without additional text
- Generate 3-7 clips per video
- Each clip should be 45-120 seconds long for technical completeness`,
    },
};

export function SystemPromptEditor({ isOpen, onClose, currentPrompt, onSave }: SystemPromptEditorProps) {
    const [prompt, setPrompt] = useState(currentPrompt || DEFAULT_PROMPT);
    const [activePreset, setActivePreset] = useState<keyof typeof PRESETS | null>('default');

    useEffect(() => {
        setPrompt(currentPrompt || DEFAULT_PROMPT);
    }, [currentPrompt, isOpen]);

    const handlePresetClick = (presetKey: keyof typeof PRESETS) => {
        setPrompt(PRESETS[presetKey].prompt);
        setActivePreset(presetKey);
    };

    const handleSave = () => {
        onSave(prompt);
        onClose();
    };

    const handleReset = () => {
        setPrompt(DEFAULT_PROMPT);
        setActivePreset('default');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/20">
                            <Sparkles className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">System Prompt Editor</h2>
                            <p className="text-sm text-gray-400">Customize how AI analyzes your videos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Presets */}
                <div className="p-6 border-b border-white/10">
                    <p className="text-sm text-gray-400 mb-3">Quick Presets:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(PRESETS).map(([key, preset]) => {
                            const Icon = preset.icon;
                            const isActive = activePreset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetClick(key as keyof typeof PRESETS)}
                                    className={`p-3 rounded-lg border transition-all ${isActive
                                            ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                                            : 'border-white/10 hover:border-primary-500/50 text-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mx-auto mb-1" />
                                    <p className="text-xs font-medium text-center">{preset.name}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">Custom Prompt</label>
                        <span className="text-xs text-gray-500">{prompt.length} characters</span>
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            setActivePreset(null);
                        }}
                        className="w-full h-64 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none font-mono text-sm"
                        placeholder="Enter your custom system prompt..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: Ensure your prompt includes instructions for JSON output format
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-6 border-t border-white/10">
                    <button
                        onClick={handleReset}
                        className="btn-secondary"
                    >
                        Reset to Default
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Save Prompt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
