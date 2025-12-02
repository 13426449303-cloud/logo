import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { generateLogoParams, generateLogoParamsFromImage } from '../services/geminiService';
import { LogoSystem, LogoLayer } from '../types';

interface AIPromptProps {
  onSystemGenerated: (system: LogoSystem) => void;
  onEnable3D: () => void;
}

export const AIPrompt: React.FC<AIPromptProps> = ({ onSystemGenerated, onEnable3D }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSuccess = (result: any) => {
    // Convert response to LogoSystem with IDs
    const newSystem: LogoSystem = {
      name: result.name || "Deconstructed Logo",
      description: result.description || "AI Deconstructed Representation",
      backgroundColor: result.backgroundColor || "#0f172a",
      layers: result.layers.map((l: any, i: number) => ({
        ...l,
        id: `ai-layer-${Date.now()}-${i}`,
      } as LogoLayer))
    };
    onSystemGenerated(newSystem);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await generateLogoParams(prompt);
      handleSuccess(result);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const result = await generateLogoParamsFromImage(base64String, prompt || "Deconstruct this logo into geometric layers");
        
        handleSuccess(result);
        
        // Auto-enable 3D mode for decomposition view
        onEnable3D();
        
      } catch (err: any) {
        console.error(err);
        setError("Failed to process image. Try a smaller JPG/PNG.");
      } finally {
        setLoading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-400" size={16} />
          <h3 className="text-sm font-semibold text-white">AI Generator</h3>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
             title="Upload image to decompose"
             disabled={loading}
           >
             <Upload size={14} /> Import Image
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/jpeg, image/png, image/webp"
             onChange={handleFileUpload}
           />
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe vision OR upload logo to decompose..."
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 min-h-[80px] resize-none pr-12"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all shadow-lg hover:shadow-purple-500/25"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
      
      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
      <p className="text-[10px] text-slate-500 mt-2 text-right">Powered by Gemini 2.5 Flash</p>
    </div>
  );
};